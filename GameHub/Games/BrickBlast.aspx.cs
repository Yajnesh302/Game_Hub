using System;
using System.Collections.Generic;
using System.Web.Services;
using System.Web.UI;
using GameHub.Services;

namespace GameHub.Games
{
    public partial class BrickBlastPage : Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
        }

        [WebMethod]
        public static ScoreBrickBlastRecord SaveScore(string playerName, int score, int levelReached)
        {
            return GameManager.Instance.SaveBrickBlastScore(playerName, score, levelReached);
        }

        [WebMethod]
        public static List<ScoreBrickBlastRecord> GetLeaderboard()
        {
            return GameManager.Instance.GetBrickBlastLeaderboard();
        }
    }
}
