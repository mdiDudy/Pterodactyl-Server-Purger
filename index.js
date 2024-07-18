/*

NAME: Pterodactyl-Server-Purger
AUTHORS: Menudo G., MDI, TheKraters, Hasen
LICENSE: The license is in the code!

*/

const axios = require('axios');
const chalk = require('chalk');
const config = require('./config.json');

const headers = {
  'Authorization': `Bearer ${config.apiKey}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

const fetchAllServers = async () => {
  console.log(chalk.yellow('Attempting to fetch all servers...'));
  console.log(chalk.cyan('Made by the LylaNodes Team'));
  let allServers = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    try {
      const response = await axios.get(`${config.panelUrl}/api/application/servers`, {
        headers,
        params: {
          page,
          per_page: perPage
        }
      });
      const servers = response.data.data;
      if (servers.length === 0) break;
      allServers = allServers.concat(servers);
      page += 1;
    } catch (error) {
      console.error(chalk.red('Error fetching servers:'), error.message);
      break;
    }
  }

  console.log(chalk.green(`Fetched ${allServers.length} servers.`));
  return allServers;
};

const deleteServer = async (serverId) => {
  console.log(chalk.yellow(`Attempting to delete server ${serverId}...`));
  try {
    await axios.delete(`${config.panelUrl}/api/application/servers/${serverId}`, { headers });
    console.log(chalk.green(`Deleted server ${serverId}`));
  } catch (error) {
    console.error(chalk.red(`Error deleting server ${serverId}:`), error.message);
  }
};

const purgeServers = async () => {
  const servers = await fetchAllServers();
  if (servers.length === 0) {
    console.log(chalk.yellow('No servers to process.'));
    return;
  }
  for (const server of servers) {
    const serverName = server.attributes.name;
    const nodeId = server.attributes.node;
    console.log(chalk.cyan(`Processing server: ${serverName} on node ${nodeId}`));
    if (config.nodeIds.includes(nodeId) && !serverName.includes(config.excludedNameKeyword)) {
      console.log(chalk.yellow(`Server ${serverName} does not contain '${config.excludedNameKeyword}'. It will be deleted.`));
      await deleteServer(server.attributes.id);
    } else {
      console.log(chalk.yellow(`Server ${serverName} contains '${config.excludedNameKeyword}' or is not on a specified node. It will not be deleted.`));
    }
  }
};

const main = async () => {
  while (true) {
    console.log(chalk.blue('Trying to start the purging cycle...'));
    console.log(chalk.cyan('Made by the LylaNodes Team'));
    try {
      await purgeServers();
      console.log(chalk.green('Purge cycle completed successfully.'));
    } catch (error) {
      console.error(chalk.red('Error in purging servers:'), error);
    }
    console.log(chalk.blue('Waiting for the next cycle...'));
    console.log(chalk.cyan('Made by the LylaNodes Team!'));
    await new Promise(resolve => setTimeout(resolve, 10000)); // This, is a 10 second delay.
  }
};

main().catch(error => console.error(chalk.red('Unexpected error in main function:'), error));

