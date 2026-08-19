/* ==========================================================================
   GAME HUB - Air Hockey Shared Physics Engine
   Handles table boundaries, wall bouncing, elastic paddle collisions & goals
   ========================================================================== */

(function(window) {
    'use strict';

    var Physics = {
        TABLE_WIDTH: 800,
        TABLE_HEIGHT: 480,
        PADDLE_RADIUS: 32,
        PUCK_RADIUS: 18,
        GOAL_TOP: 150,
        GOAL_BOTTOM: 330,
        PUCK_MAX_SPEED: 26,
        FRICTION: 0.993,
        RESTITUTION: 0.96, // Bounciness

        createPuck: function(x, y, vx, vy) {
            return {
                x: (typeof x === 'number') ? x : 400,
                y: (typeof y === 'number') ? y : 240,
                vx: vx || 0,
                vy: vy || 0,
                radius: this.PUCK_RADIUS
            };
        },

        createPaddle: function(x, y) {
            return {
                x: (typeof x === 'number') ? x : 120,
                y: (typeof y === 'number') ? y : 240,
                vx: 0,
                vy: 0,
                radius: this.PADDLE_RADIUS
            };
        },

        clampPaddle: function(paddle, isP1) {
            var r = this.PADDLE_RADIUS;
            var minX = isP1 ? r + 6 : (this.TABLE_WIDTH / 2) + r + 6;
            var maxX = isP1 ? (this.TABLE_WIDTH / 2) - r - 6 : this.TABLE_WIDTH - r - 6;
            var minY = r + 6;
            var maxY = this.TABLE_HEIGHT - r - 6;

            paddle.x = Math.max(minX, Math.min(maxX, paddle.x));
            paddle.y = Math.max(minY, Math.min(maxY, paddle.y));
        },

        // Resolves elastic collision between paddle and puck with guaranteed impulse
        resolvePaddleCollision: function(paddle, puck) {
            var dx = puck.x - paddle.x;
            var dy = puck.y - paddle.y;
            var distSq = dx * dx + dy * dy;
            var minDist = paddle.radius + puck.radius;

            if (distSq < minDist * minDist) {
                var dist = Math.sqrt(distSq);
                if (dist === 0) {
                    dist = 1;
                    dx = 1;
                    dy = 0;
                }
                var nx = dx / dist;
                var ny = dy / dist;

                // Push puck completely out of paddle overlap to prevent any sticking
                var overlap = minDist - dist + 1.5;
                puck.x += nx * overlap;
                puck.y += ny * overlap;

                // Relative velocity calculation
                var pvx = (paddle.vx || 0);
                var pvy = (paddle.vy || 0);
                var paddleSpeed = Math.sqrt(pvx * pvx + pvy * pvy);

                var rvx = puck.vx - pvx;
                var rvy = puck.vy - pvy;
                var velAlongNormal = rvx * nx + rvy * ny;

                // Elastic reflection
                if (velAlongNormal < 0) {
                    var impulse = -(1.0 + this.RESTITUTION) * velAlongNormal;
                    puck.vx += impulse * nx;
                    puck.vy += impulse * ny;
                }

                // Impart paddle kinetic swing energy directly into puck along collision normal
                var pushImpulse = Math.max(4.5, paddleSpeed * 0.85);
                puck.vx += nx * pushImpulse;
                puck.vy += ny * pushImpulse;

                // Ensure strong minimum exit speed so puck never gets stuck
                var currentSpeed = Math.sqrt(puck.vx * puck.vx + puck.vy * puck.vy);
                if (currentSpeed < 5.0) {
                    puck.vx = nx * 5.5;
                    puck.vy = ny * 5.5;
                } else if (currentSpeed > this.PUCK_MAX_SPEED) {
                    puck.vx = (puck.vx / currentSpeed) * this.PUCK_MAX_SPEED;
                    puck.vy = (puck.vy / currentSpeed) * this.PUCK_MAX_SPEED;
                }

                return true; // Collision occurred
            }
            return false;
        },

        // Updates puck physics for one frame
        updatePuck: function(puck, p1Paddle, p2Paddle) {
            var collision = false;

            // Apply friction
            puck.vx *= this.FRICTION;
            puck.vy *= this.FRICTION;

            // Stop micro-jitters
            if (Math.abs(puck.vx) < 0.05) puck.vx = 0;
            if (Math.abs(puck.vy) < 0.05) puck.vy = 0;

            // Update position
            puck.x += puck.vx;
            puck.y += puck.vy;

            // Paddle collisions
            if (p1Paddle && this.resolvePaddleCollision(p1Paddle, puck)) collision = true;
            if (p2Paddle && this.resolvePaddleCollision(p2Paddle, puck)) collision = true;

            // Top / Bottom Wall Bounces
            var r = puck.radius;
            if (puck.y - r < 6) {
                puck.y = 6 + r;
                puck.vy = Math.abs(puck.vy) * this.RESTITUTION;
                collision = true;
            } else if (puck.y + r > this.TABLE_HEIGHT - 6) {
                puck.y = this.TABLE_HEIGHT - 6 - r;
                puck.vy = -Math.abs(puck.vy) * this.RESTITUTION;
                collision = true;
            }

            // Left / Right Wall Bounces (excluding goal mouths)
            var inGoalY = (puck.y >= this.GOAL_TOP && puck.y <= this.GOAL_BOTTOM);

            if (!inGoalY) {
                if (puck.x - r < 6) {
                    puck.x = 6 + r;
                    puck.vx = Math.abs(puck.vx) * this.RESTITUTION;
                    collision = true;
                } else if (puck.x + r > this.TABLE_WIDTH - 6) {
                    puck.x = this.TABLE_WIDTH - 6 - r;
                    puck.vx = -Math.abs(puck.vx) * this.RESTITUTION;
                    collision = true;
                }
            }

            return collision;
        },

        // Goal detection: returns 0 (none), 1 (P1 conceded -> P2 scores), 2 (P2 conceded -> P1 scores)
        checkGoal: function(puck) {
            if (puck.y >= this.GOAL_TOP && puck.y <= this.GOAL_BOTTOM) {
                if (puck.x < -puck.radius - 2) {
                    return 2; // Puck entered Left Goal -> Player 2 (Right) scores!
                }
                if (puck.x > this.TABLE_WIDTH + puck.radius + 2) {
                    return 1; // Puck entered Right Goal -> Player 1 (Left) scores!
                }
            }
            return 0;
        }
    };

    window.AirHockeyPhysics = Physics;

})(window);
