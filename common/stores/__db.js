var fs = require("fs");
var { Pool } = require("pg");

module.exports = async (bot) => {
  //   const db = new Pool();
  const db = new Pool({
    connectionString: process.env.DB_CONNECTION_STRING,
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  await db.query(`
		CREATE TABLE IF NOT EXISTS profiles (
			id 			SERIAL PRIMARY KEY,
			user_id 	TEXT,
			name 		TEXT,
			description	TEXT,
			color 		TEXT,
			level 		INTEGER,
			exp		 	INTEGER,
			disabled 	BOOLEAN
		);

		CREATE TABLE IF NOT EXISTS configs (
			id 					SERIAL PRIMARY KEY,
			server_id 			TEXT,
			response_channel 	TEXT,
			message 			TEXT,
			prefix 				TEXT,
			reacts 				BOOLEAN,
			embed 				BOOLEAN,
			opped 				JSONB,
			ticket_category 	TEXT,
			ticket_message		TEXT,
			autodm 				TEXT,
			autothread			BOOLEAN
		);

		CREATE TABLE IF NOT EXISTS forms (
			id 				SERIAL PRIMARY KEY,
			server_id		TEXT,
			hid 			TEXT UNIQUE,
			name 			TEXT,
			description 	TEXT,
			questions 		JSONB,
			channel_id 		TEXT,
			roles 			JSONB,
			message 		TEXT,
			color 			TEXT,
			open 			BOOLEAN,
			cooldown 		INTEGER,
			emoji 			TEXT,
			reacts 			BOOLEAN,
			embed 			BOOLEAN,
			apply_channel 	TEXT,
			tickets_id 		TEXT,
			ticket_msg 		TEXT
		);

		CREATE TABLE IF NOT EXISTS extras (
			id 			SERIAL PRIMARY KEY,
			key 		TEXT,
			val 		TEXT
		);

		CREATE TABLE IF NOT EXISTS form_posts (
			id 			SERIAL PRIMARY KEY,
			server_id 	TEXT,
			channel_id 	TEXT,
			message_id 	TEXT,
			form 		TEXT REFERENCES forms(hid) ON DELETE CASCADE,
			bound 		BOOLEAN
		);

		CREATE TABLE IF NOT EXISTS hooks (
			id 			SERIAL PRIMARY KEY,
			server_id	TEXT,
			form 		TEXT,
			hid 		TEXT,
			url 		TEXT,
			events 		TEXT[]
		);

		CREATE TABLE IF NOT EXISTS open_responses (
			id 			SERIAL PRIMARY KEY,
			server_id 	TEXT,
			channel_id 	TEXT,
			message_id 	TEXT,
			user_id 	TEXT,
			form 		TEXT REFERENCES forms(hid) ON DELETE CASCADE,
			questions   JSONB,
			answers 	TEXT[],
			selection   TEXT[],
			page 		INTEGER
		);

		CREATE TABLE IF NOT EXISTS responses (
			id 			SERIAL PRIMARY KEY,
			server_id 	TEXT,
			hid 		TEXT UNIQUE,
			user_id 	TEXT,
			form 		TEXT REFERENCES forms(hid) ON DELETE CASCADE,
			questions 	JSONB,
			answers 	TEXT[],
			status 		TEXT,
			received 	TIMESTAMPTZ
		);

		CREATE TABLE IF NOT EXISTS response_posts (
			id 			SERIAL PRIMARY KEY,
			server_id 	TEXT,
			channel_id 	TEXT,
			message_id 	TEXT,
			response 	TEXT REFERENCES responses(hid) ON DELETE CASCADE,
			page 		INTEGER
		);

		CREATE TABLE IF NOT EXISTS tickets (
			id			SERIAL PRIMARY KEY,
			server_id	TEXT,
			channel_id	TEXT,
			response_id	TEXT
		);

		CREATE OR REPLACE FUNCTION gen_hid() RETURNS TEXT AS
			'select lower(substr(md5(random()::text), 0, 5));'
		LANGUAGE SQL VOLATILE;

		CREATE OR REPLACE FUNCTION find_unique(_tbl regclass) RETURNS TEXT AS $$
			DECLARE nhid TEXT;
			DECLARE res BOOL;
			BEGIN
				LOOP
					nhid := gen_hid();
					EXECUTE format(
						'SELECT (EXISTS (
							SELECT FROM %s
							WHERE hid = %L
						))::bool',
						_tbl, nhid
					) INTO res;
					IF NOT res THEN RETURN nhid; END IF;
				END LOOP;
			END
		$$ LANGUAGE PLPGSQL VOLATILE;
	`);

  bot.stores = {};
  var files = fs.readdirSync(__dirname);
  for (var file of files) {
    if (!file.endsWith(".js") || ["__db.js"].includes(file)) continue;
    var name = file.replace(/\.js/i, "");
    bot.stores[name] = require(__dirname + "/" + file)(bot, db);
    if (bot.stores[name].init) bot.stores[name].init();
  }

  files = fs.readdirSync(__dirname + "/migrations");
  files = files.sort((a, b) => {
    a = parseInt(a.slice(0, -3));
    b = parseInt(b.slice(0, -3));

    return a - b;
  });
  var version = parseInt(
    (await db.query(`SELECT * FROM extras WHERE key = 'version'`)).rows[0]
      ?.val || -1
  );
  if (files.length > version + 1) {
    for (var i = version + 1; i < files.length; i++) {
      if (!files[i]) continue;
      var migration = require(`${__dirname}/migrations/${files[i]}`);
      try {
        await migration(bot, db);
      } catch (e) {
        console.log(e);
        process.exit(1);
      }

      if (version == -1)
        await db.query(`INSERT INTO extras (key, val) VALUES ('version', 0)`);
      else
        await db.query(`UPDATE extras SET val = $1 WHERE key = 'version'`, [i]);
    }
  }

  return db;
};
