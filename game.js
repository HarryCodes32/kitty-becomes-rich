<script>
    (function(){
        // --- Game Setup and Variables ---
        const STORAGE_KEY = 'kittycoins_game';
        
        // Asset Data (Could be expanded for many upgrades)
        const assets = {
            post: {
                count: 0,
                baseCost: 10,
                cost: 10, // Current cost
                kps: 1,  // KPS generated per item
                power: 1.15 // Cost growth factor
            }
        };

        let kitCoins = 1; // Start with 1 KitCoin
        let clickPower = 1; // How much you get per scratch button click
        let kitCoinsPerSecond = 0;
        
        // DOM References (for efficiency)
        const display = document.getElementById('kittycoins');
        const kpsDisplay = document.getElementById('kpsCount');
        const postCountDisplay = document.getElementById('postCount');
        const postCostDisplay = document.getElementById('postCostDisplay');
        const scratchPowerDisplay = document.getElementById('scratchPower');
        const scratchBtn = document.getElementById('scratchBtn');
        const postUpgradeItem = document.querySelector('.upgrade-item');


        // --- Save/Load Functions ---

        function saveGame() {
            const gameState = {
                c: kitCoins,
                p: clickPower,
                a: assets // Saves all asset data
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
        }

        function loadGame() {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const gameState = JSON.parse(stored);
                kitCoins = gameState.c || 1; // Default to 1 if missing
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
            // Recalculate total KPS from all assets
            kitCoinsPerSecond = assets.post.count * assets.post.kps;
        }

        function updateDisplay() {
            // Update currency and statistics
            display.textContent = 'KitCoins: ' + Math.floor(kitCoins).toLocaleString('en-US');
            kpsDisplay.textContent = kitCoinsPerSecond.toLocaleString('en-US');
            scratchPowerDisplay.textContent = clickPower;
            
            // Update asset displays
            postCountDisplay.textContent = assets.post.count;
            postCostDisplay.textContent = 'Cost: ' + Math.ceil(assets.post.cost).toLocaleString('en-US') + ' KitCoins';

            // Optional: Toggle purchase ability look
            if (kitCoins >= assets.post.cost) {
                postUpgradeItem.classList.remove('locked');
            } else {
                postUpgradeItem.classList.add('locked');
            }
        }
        
        function scratchPost() {
            kitCoins += clickPower;
            
            // brief glow animation
            scratchBtn.classList.add('glow');
            setTimeout(() => scratchBtn.classList.remove('glow'), 200);

            saveGame();
            updateDisplay();
        }

        function buyAsset(assetId) {
            const asset = assets[assetId];

            if (kitCoins >= asset.cost) {
                kitCoins -= asset.cost; 
                asset.count += 1;
                
                // Increase next cost (exponential growth)
                asset.cost *= asset.power; 
                
                calculateKPS(); // Recalculate KPS immediately
                
                saveGame();
                updateDisplay();
            } else {
                // Not enough money feedback (can be improved)
                console.log("Not enough KitCoins to buy " + assetId + "!");
            }
        }
        
        // Make buyAsset accessible from HTML onclick
        window.buyAsset = buyAsset; 
        
        // Attach the scratch function to the button
        scratchBtn.addEventListener('click', scratchPost);


        // --- The Idle Loop (Runs every second) ---
        function generateIdleKitCoins() {
            if (kitCoinsPerSecond > 0) {
                kitCoins += kitCoinsPerSecond; // Add full KPS once per second
                saveGame();
                updateDisplay();
            }
        }

        // Start the game loop (1000ms = 1 second)
        setInterval(generateIdleKitCoins, 1000);
        

        // --- Initial Game Load ---
        loadGame();
        calculateKPS(); // Must calculate KPS based on loaded assets
        updateDisplay();
    })();
</script>
