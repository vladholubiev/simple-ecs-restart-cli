#!/usr/bin/env node

import inquirer from 'inquirer';
import {ls, lsClusters, start, stop} from 'simple-ecs-restart';
import ora from 'ora';
import notifier from 'node-notifier';

const questions = [
  {
    type: 'list',
    name: 'cluster',
    message: 'ECS Cluster Name',
    choices() {
      const done = this.async();

      return lsClusters().then(clusters => done(null, clusters));
    }
  },
  {
    type: 'list',
    name: 'service',
    message: 'Service to restart',
    choices({cluster}) {
      const done = this.async();

      return ls('us-east-1', cluster).then(services => {
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
  notifier.notify(startMessage);

  await start(region, cluster, service);
  startSpinner.stopAndPersist();

  console.log(`\n${restartMessage}`);
  notifier.notify(restartMessage);

  return process.exit(1);
});
