<script>
    let { status } = $props();

    function getStatusColor(status) {
        switch (status) {
            case 'online':
                return 'green';
            case 'offline':
                return 'red';
            case 'busy':
                return 'yellow';
            case 'away':
                return 'gray';
            default:
                return 'gray';
        }
    }
</script>

<span class="status-badge {getStatusColor(status)}"></span>

<style>
    .status-badge {
        display: inline-block;
        width: 1em;
        height: 1em;
        border-radius: 0;
        clip-path: polygon(50% 0%, 82% 14%, 100% 50%, 82% 86%, 50% 100%, 18% 86%, 0% 50%, 18% 14%);
        animation-duration: 1s;
        animation-iteration-count: infinite;
    }

    .green {
        background-color: #2ecc71;
        animation-name: pulse;
        animation-duration: 1s;
        animation-timing-function: ease-in-out;
    }

    .red {
        background-color: #e74c3c;
        animation-name: implosion;
        animation-duration: 4s;
        animation-timing-function: ease-in-out;
        animation-direction: alternate-reverse;
    }

    .yellow {
        background-color: #f1c40f;
        animation-name: shake;
        animation-duration: 1.5s;
        animation-timing-function: ease-in-out;
    }

    .gray {
        background-color: #95a5a6;
    }

    @keyframes pulse {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.1);
        }
        100% {
            transform: scale(1);
        }
    }

    @keyframes implosion {
        20% {
            transform: scale(1);
        }
        50% {
            transform: scale(0.8);
        }
        100% {
            transform: scale(0.7);
        }
    }

    @keyframes shake {
        0% {
            transform: translateX(0);
        }
        25% {
            transform: translateX(-0.5px);
        }
        50% {
            transform: translateX(0.5px);
        }
        75% {
            transform: translateX(-0.5px);
        }
        100% {
            transform: translateX(0);
        }
    }
</style>
