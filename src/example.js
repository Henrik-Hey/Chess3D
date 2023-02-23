function coinChange(coins, amount){
    coins.sort((a,b) => b - a)
    const dp = Array.from({ length: amount + 1}, () => Infinity); // i is amount, value is count
    dp[0] = 0;
    coins.forEach(coin => {
        for (let sum = coin; sum < amount + 1; sum += coin){
            console.log({sum, coin, "dp[sum]": dp[sum], "dp[sum - coin] + 1": dp[sum - coin] + 1})
            dp[sum] = Math.min(dp[sum], dp[sum - coin] + 1);
        }

    })
    return dp[amount] === Infinity ? -1 : dp[amount];
}

function minCost(n, cuts){
    const dp = Array.from({length: n + 1}, () => []);
    const dfs = (lo, hi) => {
        if (dp[lo][hi]) return dp[lo][hi];
        const cutsWithinRegion = cuts.filter(cut => lo < cut && cut < hi);
        if (cutsWithinRegion.length === 0) return 0;
        let ans = Infinity;
        cutsWithinRegion.forEach(mid => {
            ans = Math.min(ans, dfs(lo, mid) + dfs(mid, hi));
        });
        dp[lo][hi] = ans + hi - lo;
        return dp[lo][hi];
    }
    return dfs(0, n);
}
console.log(minCost(904155, [60599,872565,106588,299061,830358,504484,142986,598159,584815,362882,533486,855258,328289,188285,736514,540777,449564,585383,864897,819770,158993,193814,279806,805636,352263,399101,590155,172219,765423,23275,57133,358858,476230,651240,579361,681289,156419,646520,903060,436951,27334,658707,864117,701808,51541,739940,310250,25147,412978,888233,80113,206707,341048,613175,584485,661419,34372]))