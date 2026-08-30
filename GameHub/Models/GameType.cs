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
        Chess = 9,
        SpeedMath = 10,
        SlingPuck = 11,
        DotsAndBoxes = 12,
        Codebreaker = 13,
        MemoryMatrix = 14,
        LaserMirrors = 15,
        AlgoBot = 16,
        WordDuel = 17,
        LightsOut = 18,
        Custom = 99
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
