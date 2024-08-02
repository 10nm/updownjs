require('dotenv').config();

const hosts = process.env.HOSTS.split(',').map((host, index) => {
    const [hostAddress, port] = host.split(':');
    return { host: hostAddress, port: parseInt(port, 10), messageOnUP: process.env.messageOnUP.split(',')[index], messageOnDown: process.env.messageOnDown.split(',')[index] ,titlesOnDown : process.env.titlesOnDown.split(',')[index], titlesOnUP : process.env.titlesOnUP.split(',')[index], messageDomain : process.env.messageDomain.split(',')[index] };
});


module.exports = {
    token: process.env.TOKEN1,
    channel: process.env.CHANNEL1,
    hosts: hosts
};