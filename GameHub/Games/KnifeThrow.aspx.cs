using System;
using System.Collections.Generic;
using System.Web.Services;
using System.Web.UI;
using GameHub.Services;

namespace GameHub.Games
{
    public partial class KnifeThrowPage : Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
        }

        [WebMethod]
        public static ScoreKnifeThrowRecord SaveScore(string playerName, int score, int levelReached)
        {
            return GameManager.Instance.SaveKnifeThrowScore(playerName, score, levelReached);
        }

        [WebMethod]
        public static List<ScoreKnifeThrowRecord> GetLeaderboard()
        {
            return GameManager.Instance.GetKnifeThrowLeaderboard();
        }
    }
}
