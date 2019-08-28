const { spawn } = require('child_process');
// const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Might need this for later.
/**
 * @param  {String} err
 * @param  {} res caspinfsa
 */
function doSomething(err, res) {
}

/**
 * @param  {Function[]} cb is a Function that blahbah
 */
(async function (cb) {
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

      const db = new sqlite3.Database(data.toString().trim(), sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
          return console.error(err.message);
        }
        console.log("Connected to SQlite3 DB.");
      });
      
      db.close((err) => {
        if(err) {
          return console.err(err.message);
        }
        console.log("Closed the SQliet3 DB connection.");
      });

    });

    find.stderr.on('data', (data) => {
      console.log('find: ', data.toString());
    });

    find.on('close', (code) => {
      console.log('find: ', `Child process exited with code ${code}`);
    });
    // end find

    console.log('stat: ', data.toString());
  });

  stat.stderr.on('data', () => {
    console.log('stat: ', data.toString());
  });

  stat.on('close', (code) => {
    console.log('stat: ', `Child process exited with code ${code}`);
  });
  // end stat
}
)(doSomething);

// 2) Find where the sqlite DB for Messages is located

// 3) Drop all the data

// 4) Reopen iMessages.


// const messages_path = exec('sh find_messages_db_path.sh', (error, stdout, stderr) => {

// });
