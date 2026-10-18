import { join, dirname } from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { setupMaster, fork } from 'cluster';
import { watchFile, unwatchFile } from 'fs';
import cfonts from 'cfonts';
import { createInterface } from 'readline';
import chalk from 'chalk';

console.log('\nIniciando Sistema...');

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const yargs = require('yargs');
const { name, description, author, version } = require(join(__dirname, './package.json'));

const { say } = cfonts;
const rl = createInterface(process.stdin, process.stdout);

say('Shadow\nUltra', {
  font: 'chrome',
  align: 'center',
  gradient: ['red', 'magenta']
});
say('Created by Criss Escobar', {
  font: 'console',
  align: 'center',
  gradient: ['red', 'magenta']
});

let isRunning = false;

function start(file) {
  if (isRunning) return;
  isRunning = true;

  const args = [join(__dirname, file), ...process.argv.slice(2)];
  say(args.join(' '), {
    font: 'console',
    align: 'center',
    gradient: ['red', 'magenta']
  });

  setupMaster({
    exec: args[0],
    args: args.slice(1),
  });

  let p = fork();

  p.on('message', data => {
    switch (data) {
      case 'reset':
        p.process.kill();
        isRunning = false;
        start(file);  // Reinicia el bot cuando se solicita un reset
        break;
      case 'uptime':
        p.send(process.uptime());
        break;
    }
  });

  p.on('exit', (_, code) => {
    isRunning = false;
    console.error('❌ Error:\n', code);

    // Si el proceso hijo falla, lo reiniciamos automáticamente
    if (code !== 0) {
      console.log('Reiniciando sub-bot...');
      watchFile(args[0], () => {
        unwatchFile(args[0]);
        start(file);  // Reinicia el bot cuando detecta cambios
      });
    }
  });

  let opts = yargs(process.argv.slice(2)).exitProcess(false).parse();
  if (!opts.test && !rl.listenerCount()) {
    rl.on('line', (line) => {
      p.emit('message', line.trim());  // Pasa las entradas del usuario al sub-bot
    });
  }
}

// Escucha las advertencias del sistema
process.on('warning', (warning) => {
  if (warning.name === 'MaxListenersExceededWarning') {
    console.warn('🔴 Se excedió el límite de Listeners en:');
    console.warn(warning.stack);
  }
});

// Inicia el proceso con el archivo 'main.js'
start('main.js');
