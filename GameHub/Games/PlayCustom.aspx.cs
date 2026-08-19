using System;
using System.Web.UI;
using GameHub.Models;
using GameHub.Services;

namespace GameHub.Games
{
    public partial class PlayCustomPage : Page
    {
        public CustomGameManifest GameManifest { get; set; }
        public string GameUrl { get; set; }

        protected void Page_Load(object sender, EventArgs e)
        {
            string gameId = Request.QueryString["game"];
            if (string.IsNullOrEmpty(gameId))
            {
                Response.Redirect("~/Default.aspx");
                return;
            }

            GameManifest = CustomGameService.Instance.GetGame(gameId);
            if (GameManifest == null)
            {
                Response.Redirect("~/Default.aspx");
                return;
            }

            Title = GameManifest.Title + " - Game Hub";
            GameUrl = ResolveUrl("~/" + GameManifest.RelativeUrl);
        }
    }
}
