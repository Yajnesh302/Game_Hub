using System;
using System.Collections.Generic;
using System.Web.Services;
using System.Web.UI;
using GameHub.Services;

namespace GameHub.Games
{
    public partial class Game2048Page : Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
        }

        [WebMethod]
        public static Score2048Record SaveScore(string playerName, int score, int bestTile)
        {
            return GameManager.Instance.Save2048Score(playerName, score, bestTile);
        }

        [WebMethod]
        public static List<Score2048Record> GetLeaderboard()
        {
            return GameManager.Instance.Get2048Leaderboard();
        }
    }
}
