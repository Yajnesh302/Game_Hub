namespace GameHub.Models
{
    public enum GameType
    {
        TicTacToe = 1,
        Connect4 = 2,
        RPS = 3,
        AirHockey = 4,
        Archery = 5,
        Game2048 = 6,
        BrickBlast = 7,
        KnifeThrow = 8,
        Chess = 9
    }

    public enum PlayerStatus
    {
        Idle = 0,
        InQueue = 1,
        InGame = 2
    }

    public enum SessionStatus
    {
        WaitingForPlayers = 0,
        InProgress = 1,
        Finished = 2,
        Cancelled = 3
    }
}
