const axios = require('axios');
const config = require('./config.json');

const headers = {
  'Authorization': `Bearer ${config.apiKey}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

const fetchAllServers = async () => {
  console.log('Attempting to fetch all servers...');
  console.log('Made by _mdi')
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
      console.error('Error fetching servers:', error.message);
      break;
    }
  }

  console.log(`Fetched ${allServers.length} servers.`);
  return allServers;
};

const deleteServer = async (serverId) => {
  console.log(`Attempting to delete server ${serverId}...`);
  try {
    await axios.delete(`${config.panelUrl}/api/application/servers/${serverId}`, { headers });
    console.log(`Deleted server ${serverId}`);
  } catch (error) {
    console.error(`Error deleting server ${serverId}:`, error.message);
  }
};

const purgeServers = async () => {
  const servers = await fetchAllServers();
  if (servers.length === 0) {
    console.log('No servers to process.');
    return;
  }
  for (const server of servers) {
    const serverName = server.attributes.name;
    const nodeId = server.attributes.node;
    console.log(`Processing server: ${serverName} on node ${nodeId}`);
    if (config.nodeIds.includes(nodeId) && !serverName.includes(config.excludedNameKeyword)) {
      console.log(`Server ${serverName} does not contain '${config.excludedNameKeyword}'. It will be deleted.`);
      await deleteServer(server.attributes.id);
    } else {
      console.log(`Server ${serverName} contains '${config.excludedNameKeyword}' or is not on a specified node. It will not be deleted.`);
    }
  }
};

const main = async () => {
  while (true) {
    console.log('Starting purging cycle...');
    console.log('Made by _mdi')
    try {
      await purgeServers();
      console.log('Purge cycle completed successfully.');
    } catch (error) {
      console.error('Error in purging servers:', error);
    }
    console.log('Waiting for the next cycle...');
    console.log('Made by _mdi')
    await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds delay
  }
};

main().catch(error => console.error('Unexpected error in main function:', error));
