// Wrap the entire game logic in an IIFE to keep variables private
(function(){
    // --- Game Setup and Variables ---
    const STORAGE_KEY = 'kittycoins_game';
    
    // Asset Data
    const assets = {
        post: {
            count: 0,
            baseCost: 10,
            cost: 10, 
            kps: 1,  
            power: 1.15 // Cost growth factor
        }
    };

    let kitCoins = 1; // Start with 1 KitCoin
    let clickPower = 1; 
    let kitCoinsPerSecond = 0;
    
    // DOM References
    const display = document.getElementById('kittycoins');
    const kpsDisplay = document.getElementById('kpsCount');
    const postCountDisplay = document.getElementById('postCount');
    const postCostDisplay = document.getElementById('postCostDisplay');
    const scratchPowerDisplay = document.getElementById('scratchPower');
    const scratchBtn = document.getElementById('scratchBtn');
    const postUpgradeItem = document.getElementById('postUpgradeItem');


    // --- Save/Load Functions ---

    function saveGame() {
        const gameState = {
            c: kitCoins,
            p: clickPower,
            a: assets
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    }

    function loadGame() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const gameState = JSON.parse(stored);
            kitCoins = gameState.c || 1;
            clickPower = gameState.p || 1;
            
            // Load asset data
            if(gameState.a && gameState.a.post) {
                assets.post.count = gameState.a.post.count || 0;
                assets.post.cost = gameState.a.post.cost || assets.post.baseCost;
            }
        }
    }
    
    
    // --- Core Game Functions ---

    function calculateKPS() {
        // Calculate total KPS from all assets
        kitCoinsPerSecond = assets.post.count * assets.post.kps;
    }

    function updateDisplay() {
        // Update currency and statistics, formatted for readability
        display.textContent = 'KitCoins: ' + Math.floor(kitCoins).toLocaleString('en-US');
        kpsDisplay.textContent = kitCoinsPerSecond.toLocaleString('en-US');
        scratchPowerDisplay.textContent = clickPower;
        
        // Update asset displays
        postCountDisplay.textContent = assets.post.count;
        postCostDisplay.textContent = 'Cost: ' + Math.ceil(assets.post.cost).toLocaleString('en-US') + ' KitCoins';

        // Toggle purchase ability look
        if (kitCoins >= assets.post.cost) {
            postUpgradeItem.classList.remove('locked');
            // Add a visual hint when an upgrade is affordable
            postUpgradeItem.style.boxShadow = '0 0 8px #FFEB3B'; 
        } else {
            postUpgradeItem.classList.add('locked');
            postUpgradeItem.style.boxShadow = 'none';
        }
    }
    
    // Function for clicking the main scratch button
    function scratchPost() {
        kitCoins += clickPower; // Adds the clickPower amount
        
        // brief glow animation
        scratchBtn.classList.add('glow');
        setTimeout(() => scratchBtn.classList.remove('glow'), 200);

        saveGame();
        updateDisplay();
    }

    // Function for buying any asset
    function buyAsset(assetId) {
        const asset = assets[assetId];

        if (kitCoins >= asset.cost) {
            kitCoins -= asset.cost; 
            asset.count += 1;
            
            // Increase next cost 
            asset.cost *= asset.power; 
            
            // Increase click power when buying the first asset type (Scratching Post)
            if (assetId === 'post') {
                 clickPower += 1; 
            }

            calculateKPS();
            saveGame();
            updateDisplay();
        } else {
            console.log("Not enough KitCoins to buy " + assetId + "!");
        }
    }
    
    // Attach event listeners
    scratchBtn.addEventListener('click', scratchPost); // Clicker mechanic
    postUpgradeItem.addEventListener('click', () => buyAsset('post')); // Purchase mechanic


    // --- The Idle Loop (Runs every second) ---
    function generateIdleKitCoins() {
        if (kitCoinsPerSecond > 0) {
            kitCoins += kitCoinsPerSecond; 
            saveGame();
            updateDisplay();
        }
    }

    // Start the game loop (1000ms = 1 second)
    setInterval(generateIdleKitCoins, 1000);
    

    // --- Initial Game Load ---
    loadGame();
    calculateKPS();
    updateDisplay();
})();
