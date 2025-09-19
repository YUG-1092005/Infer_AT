const dgram = require('dgram');
const os = require('os');

class NetworkDiscovery {
  constructor(port) {
    this.port = port;
    this.broadcastPort = 8888;
    this.socket = dgram.createSocket('udp4');
  }

  // Get current IP
  getCurrentIP() {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
    return null;
  }

  // Start broadcasting server info
  startBroadcast() {
    const ip = this.getCurrentIP();
    if (!ip) return;

    // Broadcast every 10 seconds
    setInterval(() => {
      try {
        const currentIP = this.getCurrentIP();
        if (currentIP) {
          const updatedMessage = JSON.stringify({
            type: 'KMRL_SERVER',
            ip: currentIP,
            port: this.port,
            timestamp: Date.now()
          });
          
          this.socket.setBroadcast(true);
          this.socket.send(updatedMessage, this.broadcastPort, '255.255.255.255');
          console.log(`📡 Broadcasting server at ${currentIP}:${this.port}`);
        }
      } catch (error) {
        console.log('Network discovery error (non-critical):', error.message);
      }
    }, 10000);
  }
}

module.exports = NetworkDiscovery;