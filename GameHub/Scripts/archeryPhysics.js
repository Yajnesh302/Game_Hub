/* ==========================================================================
   GAME HUB - Archery Clash 3D Ballistic & Olympic Scoring Engine
   Calculates 3D parabolic trajectory, aerodynamic drag, crosswind drift,
   and millimeter-accurate World Archery target ring scoring.
   ========================================================================== */

(function(window) {
    'use strict';

    var ArcheryPhysics = {
        TARGET_DISTANCE_METERS: 50,
        TARGET_RADIUS_CM: 61.0, // Standard 122cm Olympic target face (61cm radius)
        BASE_ARROW_SPEED_MPS: 80.0, // Standard 70lb Olympic recurve/compound arrow speed
        GRAVITY: 9.81,
        WIND_DRIFT_SCALE_X: 4.85, // Crosswind lateral deflection coefficient
        WIND_DRIFT_SCALE_Y: 2.50, // Vertical airflow lift/drop coefficient

        // Official World Archery 10-Ring Target Face Specifications (in cm radius)
        RINGS: [
            { maxR: 3.05, score: 10, name: "10X INNER BULLSEYE", ring: "10X", color: "#fbbf24", tier: "gold", isX: true },
            { maxR: 6.10, score: 10, name: "10 RING (GOLD)", ring: "10", color: "#f59e0b", tier: "gold", isX: false },
            { maxR: 12.20, score: 9, name: "9 RING (GOLD)", ring: "9", color: "#eab308", tier: "gold", isX: false },
            { maxR: 18.30, score: 8, name: "8 RING (RED)", ring: "8", color: "#ef4444", tier: "red", isX: false },
            { maxR: 24.40, score: 7, name: "7 RING (RED)", ring: "7", color: "#dc2626", tier: "red", isX: false },
            { maxR: 30.50, score: 6, name: "6 RING (BLUE)", ring: "6", color: "#3b82f6", tier: "blue", isX: false },
            { maxR: 36.60, score: 5, name: "5 RING (BLUE)", ring: "5", color: "#2563eb", tier: "blue", isX: false },
            { maxR: 42.70, score: 4, name: "4 RING (BLACK)", ring: "4", color: "#334155", tier: "black", isX: false },
            { maxR: 48.80, score: 3, name: "3 RING (BLACK)", ring: "3", color: "#1e293b", tier: "black", isX: false },
            { maxR: 54.90, score: 2, name: "2 RING (WHITE)", ring: "2", color: "#e2e8f0", tier: "white", isX: false },
            { maxR: 61.00, score: 1, name: "1 RING (WHITE)", ring: "1", color: "#cbd5e1", tier: "white", isX: false }
        ],

        // Calculate impact position on target face in centimeters from center
        calculateImpact: function(aimX, aimY, power, windX, windY) {
            power = Math.max(50, Math.min(100, power || 100));
            var pFactor = power / 100.0;
            var arrowSpeed = this.BASE_ARROW_SPEED_MPS * (0.65 + 0.35 * pFactor);
            var flightTime = this.TARGET_DISTANCE_METERS / arrowSpeed;
            var calibTime = this.TARGET_DISTANCE_METERS / this.BASE_ARROW_SPEED_MPS;

            // Parabolic gravity drop relative to 100% calibrated zero mark
            var dropDiffMeters = 0.5 * this.GRAVITY * (flightTime * flightTime - calibTime * calibTime);
            var gravityDropCm = dropDiffMeters * 100.0;

            // Aerodynamic Wind Deflection (crosswind + vertical thermals)
            var driftX = (windX || 0) * this.WIND_DRIFT_SCALE_X;
            var driftY = (windY || 0) * this.WIND_DRIFT_SCALE_Y;

            var hitX = aimX + driftX;
            var hitY = aimY + driftY + gravityDropCm;
            var radius = Math.sqrt(hitX * hitX + hitY * hitY);

            // Determine Scoring Ring
            var score = 0;
            var ringName = "MISS";
            var ringColor = "#64748b";
            var ringText = "M";
            var ringTier = "miss";
            var isXRing = false;
            var isBullseye = false;

            for (var i = 0; i < this.RINGS.length; i++) {
                var rInfo = this.RINGS[i];
                if (radius <= rInfo.maxR) {
                    score = rInfo.score;
                    ringName = rInfo.name;
                    ringColor = rInfo.color;
                    ringText = rInfo.ring;
                    ringTier = rInfo.tier;
                    isXRing = rInfo.isX;
                    isBullseye = (score === 10);
                    break;
                }
            }

            return {
                aimX: aimX,
                aimY: aimY,
                hitX: hitX,
                hitY: hitY,
                driftX: driftX,
                driftY: driftY,
                gravityDropCm: gravityDropCm,
                radius: radius,
                score: score,
                ringName: ringName,
                ringColor: ringColor,
                ringText: ringText,
                ringTier: ringTier,
                isBullseye: isBullseye,
                isXRing: isXRing,
                flightTimeSeconds: flightTime,
                arrowSpeedMps: arrowSpeed
            };
        },

        // 3D Parabolic Trajectory Position Generator
        // Generates 3D coordinate (x, y, z, scale, pitchAngle) along flight from shooter (z=0) to target (z=1)
        getTrajectoryPoint: function(t, startScreenX, startScreenY, targetScreenX, targetScreenY, hitCmX, hitCmY, windX, windY) {
            // Parabolic Arc Apex (arrow lifts in mid-flight and drops at the target)
            var arcHeight = 45.0 * Math.sin(t * Math.PI);

            // Wind drift builds up quadratically with time (t^1.4)
            var driftFactor = Math.pow(t, 1.4);
            var currDriftX = (windX || 0) * 18.0 * driftFactor;
            var currDriftY = (windY || 0) * 10.0 * driftFactor;

            var currX = startScreenX + (targetScreenX + hitCmX * 1.7 - startScreenX) * t + currDriftX;
            var currY = startScreenY + (targetScreenY + hitCmY * 1.7 - startScreenY) * t - arcHeight + currDriftY;

            // Perspective Scale: arrow starts large in foreground and shrinks towards 50m target
            var scale = 1.0 - (t * 0.72);

            // Arrow Flight Pitch Angle (in radians)
            var dx = (targetScreenX + hitCmX * 1.7 - startScreenX);
            var dy = (targetScreenY + hitCmY * 1.7 - startScreenY) - (Math.cos(t * Math.PI) * 45.0 * Math.PI);
            var pitchAngle = Math.atan2(dy, dx * 0.85);

            return {
                x: currX,
                y: currY,
                z: t,
                scale: scale,
                pitch: pitchAngle,
                arcHeight: arcHeight
            };
        },

        // Inverse solver for Bot AI: calculates exact aim needed to counteract current wind & gravity
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
