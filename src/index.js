const { spawn } = require('child_process');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Random things to explore/do
// ==============================
// * Currently not implementing the usage of callbacks, but we could pass a series of them via an array to perform a series
// of actions on the data.
// * Explore hashing out this functionality into a nice CLI for interactingn with iMessages data.
// * Explore integrating the data from iMessages into a web GUI or implementing data analysis on iMessages.
// * Convert this into a mini library/package for npm. (Will need to make it match best practices/conventions for npm).
// * Compare ES modules approach vs CommonJS. Handle for both?
// !! De-nest this code to avoid it becoming a callback hell.

/**
 * @param  {Function[]} callbacks
 */
(function (callbacks) {
  // close iMessages
  const bash = spawn('bash', [path.join(__dirname, '/bash/close_iMessages.sh')]);
  // find the current user logged in to add to the "find" path.
  const stat = spawn('stat', ['-f', '%Su', '/dev/console']);

  // bash
  bash.stdout.on('data', (data) => {
    console.log(`Stdout: ${data}`);
  })

  bash.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  })

  bash.on('close', (code) => {
    if (code) {
      console.log('bash: ', `Child process exited with code ${code}`);
    }

    if (callbacks) {
      // cb(err, res);
    }

  });

  // stat
  stat.stdout.on('data', (data) => {
    const find = spawn('find', [(`/Users/${data.toString().trim()}/Library/Messages/`), '-name', "chat.db", '-type', 'f'], {});

    find.stdout.on('data', (data) => {
      data = data.toString().trim();
      let tables;

      const db = new sqlite3.Database(data, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
          return console.error(err.message);
        }
        console.log('Connected to SQlite3 DB.');
      });
      
      getTableNames(data)
        .then((data) => {
          tables = data.toString().trim().split(' ');
          tables.forEach((table) => {
            const sql = `DELETE FROM ${table}`;
            db.exec(sql, (msg, err) => {
              if (err) {
                console.error(err);
              }
            });
          });

          db.close((err) => {
            if (err) {
              return console.err(err.message);
            }
            console.log("Closed the SQliet3 DB connection.");
          });

        });
    });

    find.stderr.on('data', (data) => {
      console.log('find: ', data.toString().trim());
    });

    find.on('close', (code) => {
      console.log('find: ', `Child process exited with code ${code}`);
    });
    // end find

    console.log('stat: ', data.toString().trim());
  });

  stat.stderr.on('data', () => {
    console.log('stat: ', data.toString().trim());
  });

  stat.on('close', (code) => {
    console.log('stat: ', `Child process exited with code ${code}`);
  });
  // end stat
}
)();

/**
 * This function takes the dynamically grabbed path to the iMessages DB and passes it to a bash script.
 * The bash script uses that path to echo the output from running an SQLite3 query for tables. I had to resort to this,
 * since the built in Node.js' spawn method wasn't capturing the tables as output.
 * 
 * @param  {String} dbPath is the path to the 
 * @returns {Promise<String[]|Error>} A promise to either an Error or array of Strings representing table names.
 */
function getTableNames(dbPath) {
  return new Promise((resolve, reject) => {
    const bash = spawn('bash', [path.join(__dirname, '/bash/capture_table_names.sh'), dbPath]);

    bash.stdout.on('data', (data) => {
      resolve(data);
    });

    bash.stderr.on('data', (data) => {
      reject(new Error(data));
    });

    bash.on('close', (code) => {
      console.log(`Child process exited with code ${code}`);
    })
  });
}
