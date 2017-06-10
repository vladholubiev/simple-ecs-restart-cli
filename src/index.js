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

  const stopSpinner = ora(`🔴  Stopping ${service}`).start();
  notifier.notify(`🔴  Stopping ${service}`);
  await stop(region, cluster, service);
  stopSpinner.stopAndPersist();

  const startSpinner = ora(`🔶  Starting ${service}`).start();
  await start(region, cluster, service);
  notifier.notify(`🔶  Starting ${service}`);
  startSpinner.stopAndPersist();

  console.log(`\n✅  Successfully restarted ${service}!`);
  notifier.notify(`✅  Successfully restarted ${service}!`);

  return process.exit(1);
});
