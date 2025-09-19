// Auto-discover KMRL server on network
class ServerDiscovery {
  constructor() {
    this.serverIP = localStorage.getItem('kmrl_server_ip') || 'localhost';
    this.serverPort = 5000;
  }

  // Try to find server automatically
  async discoverServer() {
    const possibleIPs = this.generatePossibleIPs();
    
    for (const ip of possibleIPs) {
      try {
        const response = await fetch(`http://${ip}:${this.serverPort}/`, {
          method: 'GET',
          timeout: 2000
        });
        
        if (response.ok) {
          console.log(`✅ Found KMRL server at ${ip}:${this.serverPort}`);
          this.serverIP = ip;
          localStorage.setItem('kmrl_server_ip', ip);
          return `${ip}:${this.serverPort}`;
        }
      } catch (error) {
        // Continue to next IP
      }
    }
    
    console.log('❌ No KMRL server found on network');
    return null;
  }

  // Generate possible IP addresses on local network
  generatePossibleIPs() {
    const ips = [];
    
    // Priority IPs - your known server
    ips.push('10.13.123.182'); // Your server IP
    
    // Common local network ranges
    const ranges = [
      '10.13.123.',  // Your current network first
      '192.168.1.',
      '192.168.0.',
      '10.0.0.'
    ];
    
    ranges.forEach(range => {
      for (let i = 1; i < 255; i++) {
        const ip = range + i;
        if (!ips.includes(ip)) {
          ips.push(ip);
        }
      }
    });
    
    // Add localhost last
    ips.push('localhost');
    
    return ips;
  }

  // Get current server address
  getServerAddress() {
    return `http://${this.serverIP}:${this.serverPort}`;
  }
}

// Auto-discover on page load
window.addEventListener('load', async () => {
  const discovery = new ServerDiscovery();
  const serverAddress = await discovery.discoverServer();
  
  if (serverAddress) {
    // Update all API calls to use discovered server
    window.KMRL_SERVER = discovery.getServerAddress();
    console.log('🚀 KMRL Server ready:', window.KMRL_SERVER);
    
    // Test API connectivity
    try {
      const testRes = await fetch(window.KMRL_SERVER + '/api/test');
      if (testRes.ok) {
        console.log('✅ API connectivity confirmed');
      }
    } catch (e) {
      console.warn('⚠️ API test failed:', e.message);
    }
    
    // Show server info to user
    showServerInfo(discovery.getServerAddress());
  } else {
    // Show manual server selection
    showManualServerSelection();
  }
});

// Show current server info
function showServerInfo(serverAddress) {
  const info = document.createElement('div');
  info.id = 'server-info';
  info.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: #4CAF50;
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    z-index: 1000;
    cursor: pointer;
  `;
  info.innerHTML = `📡 Server: ${serverAddress.replace('http://', '')}`;
  info.onclick = showManualServerSelection;
  document.body.appendChild(info);
}

// Manual server selection
function showManualServerSelection() {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  `;
  
  modal.innerHTML = `
    <div style="background: white; padding: 20px; border-radius: 10px; max-width: 400px;">
      <h3>Connect to KMRL Server</h3>
      <p style="margin: 10px 0; font-size: 14px; color: #666;">Enter the IP address of the KMRL server:</p>
      <input type="text" id="serverIP" placeholder="192.168.1.100" style="width: 100%; padding: 8px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px;">
      <div style="display: flex; gap: 10px; margin-top: 15px;">
        <button onclick="connectToServer()" style="flex: 1; padding: 10px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">Connect</button>
        <button onclick="this.parentElement.parentElement.parentElement.remove()" style="flex: 1; padding: 10px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// Connect to specific server
window.connectToServer = async function() {
  const ip = document.getElementById('serverIP').value.trim() || '10.13.123.140';
  
  try {
    const response = await fetch(`http://${ip}:5000/health`, { 
      method: 'GET',
      mode: 'cors'
    });
    if (response.ok) {
      localStorage.setItem('kmrl_server_ip', ip);
      window.KMRL_SERVER = `http://${ip}:5000`;
      console.log('✅ Connected to server:', window.KMRL_SERVER);
      document.querySelector('#server-info')?.remove();
      showServerInfo(window.KMRL_SERVER);
      document.querySelector('[style*="position: fixed"][style*="rgba(0,0,0,0.5)"]')?.remove();
      location.reload();
    } else {
      alert('Cannot connect to server at ' + ip);
    }
  } catch (error) {
    console.error('Connection error:', error);
    alert('Cannot connect to server at ' + ip + '. Error: ' + error.message);
  }
};

// Auto-connect to known server on load
if (!localStorage.getItem('kmrl_server_ip')) {
  localStorage.setItem('kmrl_server_ip', '10.13.123.182');
}

// Export for use in other scripts
window.ServerDiscovery = ServerDiscovery;