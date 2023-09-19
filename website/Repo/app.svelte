<script>
    let buttons = new Array(9).fill(null);
    let result = null;
    let turn = 'X';
    const winCombination = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    function setValue(i) {
        if (buttons[i] === null && result === null) {
            buttons[i] = turn;
            turn = turn === 'X' ? 'O' : 'X';
            checkWinner();
        }
    }

    function checkWinner() {
        for (let i = 0; i < winCombination.length; i++) {
            const [a, b, c] = winCombination[i];
            if (buttons[a] && buttons[a] === buttons[b] && buttons[a] === buttons[c]) {
                result = "Nyertes: " + buttons[a];
                return;
            }
        }
        if (!buttons.includes(null)) {
            result = 'Döntetlen';
        }
    }

    function restart() {
        buttons = new Array(9).fill(null);
        result = null;
        turn = 'X';
    }
</script>

<style>
    .tictac {
        width: 300px;
        height: 300px;
        display: flex;
        flex-wrap: wrap;
    }

    .tictac button {
        width: 100px;
        height: 100px;
        margin: 0px;
    }
</style>

{#if result === null}
<div class='tictac'>
    {#each buttons as button, i}
    <button on:click={() => setValue(i)}>
        {button ? button : ""}
    </button>
    {/each}
</div>
{:else}
<div>
    {result}
    <button on:click={restart}>
        Újra
    </button>
</div>
{/if}