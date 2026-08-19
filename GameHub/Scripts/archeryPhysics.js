/* ==========================================================================
   GAME HUB - Archery Clash 3D Ballistic & Olympic Scoring Engine
   Calculates 3D trajectory, airflow drift, gravity drop, and ring scoring
   ========================================================================== */

(function(window) {
    'use strict';

    var ArcheryPhysics = {
        TARGET_DISTANCE_METERS: 50,
        TARGET_RADIUS_CM: 60, // Standard 122cm Olympic target face (60cm radius)
        BASE_ARROW_SPEED_MPS: 75,
        GRAVITY: 9.81,
        WIND_DRIFT_SCALE_X: 4.8, // Noticeable, skill-demanding wind deflection
        WIND_DRIFT_SCALE_Y: 2.6,

        // Calculate impact position on target face in centimeters from center
        calculateImpact: function(aimX, aimY, power, windX, windY) {
            power = Math.max(40, Math.min(100, power || 100));
            var pFactor = power / 100;
            var arrowSpeed = this.BASE_ARROW_SPEED_MPS * pFactor;
            var flightTime = this.TARGET_DISTANCE_METERS / arrowSpeed;
            var calibTime = this.TARGET_DISTANCE_METERS / this.BASE_ARROW_SPEED_MPS;

            // Gravity drop relative to 100% calibrated zero
            var dropDiffMeters = 0.5 * this.GRAVITY * (flightTime * flightTime - calibTime * calibTime);
            var gravityDropCm = dropDiffMeters * 100;

            // 2D Air Flow Deflection
            var driftX = (windX || 0) * this.WIND_DRIFT_SCALE_X;
            var driftY = (windY || 0) * this.WIND_DRIFT_SCALE_Y;

            var hitX = aimX + driftX;
            var hitY = aimY + driftY + gravityDropCm;

            var radius = Math.sqrt(hitX * hitX + hitY * hitY);
            var score = 0;
            var ringName = "Miss";
            var ringColor = "#64748b";
            var isXRing = false;

            if (radius <= 3.2) {
                score = 10;
                ringName = "X-RING PERFECT BULLSEYE!";
                ringColor = "#fbbf24";
                isXRing = true;
            } else if (radius <= 6.0) {
                score = 10;
                ringName = "BULLSEYE! 10 PTS";
                ringColor = "#f59e0b";
            } else if (radius <= 12.0) {
                score = 9;
                ringName = "GOLD (9 PTS)";
                ringColor = "#eab308";
            } else if (radius <= 18.0) {
                score = 8;
                ringName = "RED (8 PTS)";
                ringColor = "#ef4444";
            } else if (radius <= 24.0) {
                score = 7;
                ringName = "RED (7 PTS)";
                ringColor = "#dc2626";
            } else if (radius <= 30.0) {
                score = 6;
                ringName = "BLUE (6 PTS)";
                ringColor = "#3b82f6";
            } else if (radius <= 36.0) {
                score = 5;
                ringName = "BLUE (5 PTS)";
                ringColor = "#2563eb";
            } else if (radius <= 42.0) {
                score = 4;
                ringName = "BLACK (4 PTS)";
                ringColor = "#1e293b";
            } else if (radius <= 48.0) {
                score = 3;
                ringName = "BLACK (3 PTS)";
                ringColor = "#0f172a";
            } else if (radius <= 54.0) {
                score = 2;
                ringName = "WHITE (2 PTS)";
                ringColor = "#e2e8f0";
            } else if (radius <= 60.0) {
                score = 1;
                ringName = "WHITE (1 PT)";
                ringColor = "#cbd5e1";
            } else {
                score = 0;
                ringName = "MISS (0 PTS)";
                ringColor = "#64748b";
            }

            return {
                aimX: aimX,
                aimY: aimY,
                hitX: hitX,
                hitY: hitY,
                driftX: driftX,
                driftY: driftY,
                radius: radius,
                score: score,
                ringName: ringName,
                ringColor: ringColor,
                isBullseye: (score === 10),
                isXRing: isXRing,
                flightTimeSeconds: flightTime
            };
        },

        // Inverse solver for Bot AI: returns ideal aim point to counter current wind
        getIdealAimPoint: function(windX, windY) {
            var counterAimX = -(windX || 0) * this.WIND_DRIFT_SCALE_X;
            var counterAimY = -(windY || 0) * this.WIND_DRIFT_SCALE_Y;
            return {
                aimX: counterAimX,
                aimY: counterAimY,
                power: 100
            };
        }
    };

    window.ArcheryPhysics = ArcheryPhysics;

})(window);
