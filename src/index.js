#!/usr/bin/env node

import inquirer from 'inquirer';
import {ls, start, stop} from 'simple-ecs-restart';
import ora from 'ora';
import notifier from 'node-notifier';

const questions = [
  {
    type: 'input',
    name: 'cluster',
    message: 'ECS Cluster Name'
  },
  {
    type: 'list',
    name: 'service',
    message: 'Service to restart',
    choices({region, cluster}) {
      const done = this.async();

      return ls(region, cluster).then(services => {
        done(null, services);
      });
    }
  }
];
const region = 'us-east-1';

inquirer.prompt(questions).then(async answers => {
  const {cluster, service} = answers;
  const stopMessage = `🔴  Stopping ${service}`;
  const startMessage = `🔶  Starting ${service}`;
  const restartMessage = `✅  Successfully restarted ${service}!`;

  const stopSpinner = ora(stopMessage).start();
  notifier.notify(stopMessage);
  await stop(region, cluster, service);
  stopSpinner.stopAndPersist();

  const startSpinner = ora(startMessage).start();
  await start(region, cluster, service);
  notifier.notify(startMessage);
  startSpinner.stopAndPersist();

  console.log(`\n${restartMessage}`);
  notifier.notify(restartMessage);

  return process.exit(1);
});
