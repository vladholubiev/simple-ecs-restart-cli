#!/usr/bin/env node

import inquirer from 'inquirer';
import {ls, start, stop} from 'simple-ecs-restart';
import ora from 'ora';

const questions = [
  {
    type: 'list',
    name: 'region',
    message: 'AWS Region',
    choices: [
      'us-east-1',
      'us-east-2',
      'us-west-1',
      'us-west-2',
      'ca-central-1',
      'eu-central-1',
      'eu-west-1',
      'eu-west-2',
      'ap-northeast-1',
      'ap-southeast-1',
      'ap-southeast-2'
    ]
  },
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

inquirer.prompt(questions).then(async answers => {
  const {region, cluster, service} = answers;

  const stopSpinner = ora(`🔴 Stopping ${service}`).start();
  await stop(region, cluster, service);
  stopSpinner.stop();

  const startSpinner = ora(`🔶 Starting ${service}`).start();
  await start(region, cluster, service);
  startSpinner.start();

  console.log(`✅ Successfully restarted ${service}!`);

  return process.exit(1);
});
