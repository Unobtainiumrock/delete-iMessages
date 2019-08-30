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
 * @param  {Function[]} cb is a Function that blahbah
 */
(function (cb) {
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

    if (cb) {
      // cb(err, res);
    }

  });

  // stat
  stat.stdout.on('data', (data) => {
    const find = spawn('find', [(`/Users/${data.toString().trim()}/Library/Messages/`), '-name', "chat.db", '-type', 'f'], {});

    find.stdout.on('data', (data) => {
      const tables = getTables(data)
        .then((data) => {
          console.log(data);
        });
      // const db = new sqlite3.Database(data.toString().trim(), sqlite3.OPEN_READWRITE, (err) => {
      //   if (err) {
      //     return console.error(err.message);
      //   }
      //   console.log('Connected to SQlite3 DB.');
      // });

      // const sql = 'SELECT * FROM DB';

      // db.all(sql,[], (err, rows) => {
      //   if (err) {
      //     throw err;
      //   }

      //   rows.forEach((row) => {
      //     console.log(row);
      //   })
      // });

      // db.close((err) => {
      //   if(err) {
      //     return console.err(err.message);
      //   }
      //   console.log("Closed the SQliet3 DB connection.");
      // });

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

// 4) Reopen iMessages.


function getTables(dbPath) {
  return new Promise((resolve, reject) => {
    const bash = spawn('bash', [path.join(__dirname, '/bash/capture_table_names.sh'), dbPath], {});

    bash.stdout.on('data', (data) => {
      resolve(data.toString().trim());
    });

    bash.stderr.on('data', (data) => {
      console.log(data.toString().trim());
      reject(data.toString().trim());
    });

    bash.on('close', (code) => {
      console.log(`Child process exited with code ${code}`);
    })
  });
}
