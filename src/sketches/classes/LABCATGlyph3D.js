export default class LABCATGlyph3D {
  constructor(p5, x, y, z, width, shouldGrow = false, isFinalGlyph = false) {
      this.p = p5;
      this.x = x;
      this.y = y;
      this.z = z;
      this.rotationX = this.p.random(0, 360);
      this.rotationY = this.p.random(0, 360);
      this.rotationZ = this.p.random(0, 360);

      this.shouldGrow = shouldGrow;
      this.width = shouldGrow ? 0 : width;

      this.isFinalGlyph = isFinalGlyph;

      if (this.isFinalGlyph) {
          this.pulseAmount = 0;
          this.pulseDirection = 1;
          this.colorPhase = 0;
          this.starRotation = 0;
      }

      this.nextColour();
  }

  nextColour() {
      const randomColour = this.p.random(this.p.colourSet);
      this.hsbColour = [
          this.p.hue(randomColour),
          this.p.saturation(randomColour),
          this.p.brightness(randomColour)
      ];

      this.hueDegree = this.hsbColour[0];
      this.brightnessTrans = this.p.map(this.hsbColour[2], 0, 100, 0.8, 0);
      this.hueTrans = this.p.map(this.hsbColour[2], 100, 0, 0.9, 0.1);
      this.center = this.width / 2;
      this.opacityMultiplier = 0;
      this.rotationX = this.p.random(0, 360);
      this.rotationY = this.p.random(0, 360);
      this.rotationZ = this.p.random(0, 360);
      this.update();
  }

  update() {
      if (this.shouldGrow) {
          this.width += 32;

          if (!this.rotationDirectionX) {
              this.rotationDirectionX = this.p.random([-1, 1]);
          }
          if (!this.rotationDirectionY) {
              this.rotationDirectionY = this.p.random([-1, 1]);
          }
          if (!this.rotationDirectionZ) {
              this.rotationDirectionZ = this.p.random([-1, 1]);
          }

          this.rotationX += 1 * this.rotationDirectionX;
          this.rotationY += 1 * this.rotationDirectionY;
          this.rotationZ += 1 * this.rotationDirectionZ;
      }

      if (this.isFinalGlyph) {
          this.pulseAmount += 0.02 * this.pulseDirection;
          if (this.pulseAmount > 1 || this.pulseAmount < 0) {
              this.pulseDirection *= -1;
          }

          this.starRotation += 0.5;
          this.colorPhase += 1;

          this.rotationX += 0.5 * this.rotationDirectionX;
          this.rotationY += 0.5 * this.rotationDirectionY;
          this.rotationZ += 0.5 * this.rotationDirectionZ;
      }

      this.opacityMultiplier = this.opacityMultiplier >= 1 ? 1 : this.opacityMultiplier + 0.05;

      this.center = this.width / 2;
      this.depth = this.width * 0.3;

      this.circleSize = this.p.map(this.hsbColour[1], 100, 0, this.width, 0 + this.width/16);

      this.satCircles = {
          'brightness' : [
              100,
              0,
              100
          ],
          'alpha' : [
              0.1875,
              0.625,
              0.375
          ],
          'size' : [
              this.circleSize,
              this.circleSize/2,
              this.circleSize/4,
          ],
          'depth' : [
              this.depth * 0.3,
              this.depth * 0.2,
              this.depth * 0.1,
          ]
      }

      if (this.isFinalGlyph) {
          this.satCircles.alpha = [
              0.6 + (this.pulseAmount * 0.3),
              0.8 - (this.pulseAmount * 0.3),
              0.7
          ];
      }

      this.horiVertMin = this.p.map(this.hueDegree, 0, 179, this.center, 0);
      this.horiVertMax = this.p.map(this.hueDegree, 0, 179, this.center, this.width);
      if(this.hueDegree > 179) {
          this.horiVertMin = 0;
          this.horiVertMax = this.width;
      }

      this.diagonalMin = this.p.map(this.hueDegree, 359, 180, (0 + this.width/8 + this.width/32), this.center);
      this.diagonalMax = this.p.map(this.hueDegree, 359, 180, (this.width - this.width/8 - this.width/32), this.center);

      if (this.isFinalGlyph) {
          const extendFactor = 1.2 + (this.pulseAmount * 0.2);
          this.horiVertMax *= extendFactor;
          this.diagonalMax *= extendFactor;
      }

      this.positions = {
          'x1': [
              -this.width/32,
              -this.width/32,
              0,
              this.width/32,
              -this.width/32,
              -this.width/32,
              0,
              this.width/32,
          ],
          'y1': [
              0,
              -this.width/32,
              -this.width/32,
              -this.width/32,
              0,
              -this.width/32,
              -this.width/32,
              -this.width/32
          ],
          'x2': [
              0,
              this.diagonalMax - this.center,
              this.horiVertMax - this.center,
              this.diagonalMax - this.center,
              0,
              this.diagonalMin - this.center,
              this.horiVertMin - this.center,
              this.diagonalMin - this.center
          ],
          'y2': [
              this.horiVertMin - this.center,
              this.diagonalMin - this.center,
              0,
              this.diagonalMax - this.center,
              this.horiVertMax - this.center,
              this.diagonalMax - this.center,
              0,
              this.diagonalMin - this.center
          ],
          'x3': [
              this.width/32,
              this.width/32,
              0,
              -this.width/32,
              this.width/32,
              this.width/32,
              0,
              -this.width/32
          ],
          'y3': [
              0,
              this.width/32,
              this.width/32,
              this.width/32,
              0,
              this.width/32,
              this.width/32,
              this.width/32
          ]
      }
  }

  drawTriangle3D(x1, y1, x2, y2, x3, y3, depth) {
      this.p.beginShape();
      this.p.vertex(x1, y1, -depth/2);
      this.p.vertex(x2, y2, -depth/2);
      this.p.vertex(x3, y3, -depth/2);
      this.p.endShape(this.p.CLOSE);

      this.p.beginShape();
      this.p.vertex(x1, y1, depth/2);
      this.p.vertex(x2, y2, depth/2);
      this.p.vertex(x3, y3, depth/2);
      this.p.endShape(this.p.CLOSE);

      this.p.beginShape();
      this.p.vertex(x1, y1, -depth/2);
      this.p.vertex(x2, y2, -depth/2);
      this.p.vertex(x2, y2, depth/2);
      this.p.vertex(x1, y1, depth/2);
      this.p.endShape(this.p.CLOSE);

      this.p.beginShape();
      this.p.vertex(x2, y2, -depth/2);
      this.p.vertex(x3, y3, -depth/2);
      this.p.vertex(x3, y3, depth/2);
      this.p.vertex(x2, y2, depth/2);
      this.p.endShape(this.p.CLOSE);

      this.p.beginShape();
      this.p.vertex(x3, y3, -depth/2);
      this.p.vertex(x1, y1, -depth/2);
      this.p.vertex(x1, y1, depth/2);
      this.p.vertex(x3, y3, depth/2);
      this.p.endShape(this.p.CLOSE);
  }

  draw() {
      if (this.width < 1) return;

      this.p.push();

      this.p.translate(this.x, this.y, this.z);
      this.p.rotateX(this.p.radians(this.rotationX));
      this.p.rotateY(this.p.radians(this.rotationY));
      this.p.rotateZ(this.p.radians(this.rotationZ));

      if (this.isFinalGlyph) {
          const numLayers = 3;
          for (let layer = 0; layer < numLayers; layer++) {
              this.p.push();

              const layerRotation = (this.starRotation * (layer + 1) * 0.5) % 360;
              const layerZ = (layer - 1) * this.depth * 0.2;

              this.p.translate(this.center, this.center, layerZ);
              this.p.rotateZ(this.p.radians(layerRotation));
              this.p.translate(-this.center, -this.center, 0);

              const colorIndex = (Math.floor(this.colorPhase / 10) + layer) % this.p.colourSet.length;
              const layerColor = this.p.colourSet[colorIndex];

              this.p.noStroke();
              this.p.fill(
                  this.p.hue(layerColor),
                  this.p.saturation(layerColor),
                  this.p.brightness(layerColor),
                  0.3
              );

              const layerScale = 1 + (layer * 0.3);
              for (let i = 0; i < 8; i++) {
                  const angle = (i / 8) * this.p.TWO_PI;
                  const distance = this.width / 3 * layerScale;
                  const x1 = this.center;
                  const y1 = this.center;
                  const x2 = this.center + this.p.cos(angle) * distance;
                  const y2 = this.center + this.p.sin(angle) * distance;
                  const x3 = this.center + this.p.cos(angle + this.p.PI/8) * distance;
                  const y3 = this.center + this.p.sin(angle + this.p.PI/8) * distance;

                  this.drawTriangle3D(x1, y1, x2, y2, x3, y3, this.depth * 0.5);
              }

              this.p.pop();
          }
      }

      this.p.noStroke();
      const torusIndices = [0, 2];
      for(let idx of torusIndices){
          if (this.isFinalGlyph) {
              const colorIndex = (Math.floor(this.colorPhase / 15) + idx) % this.p.colourSet.length;
              const circleColor = this.p.colourSet[colorIndex];

              this.p.fill(
                  this.p.hue(circleColor),
                  this.p.saturation(circleColor),
                  this.p.brightness(circleColor),
                  this.satCircles['alpha'][idx] * this.opacityMultiplier
              );
          } else {
              if (idx === 0) {
                  this.p.fill(
                      0,
                      0,
                      this.satCircles['brightness'][idx],
                      this.satCircles['alpha'][idx] * this.opacityMultiplier
                  );
              } else {
                  this.p.fill(
                      0,
                      0,
                      0,
                      0.625 * this.opacityMultiplier
                  );
              }
          }

          const torusRadius = this.satCircles['size'][idx] / 2;
          const tubeRadius = torusRadius * 0.1;
          this.p.torus(torusRadius, tubeRadius, 16, 16);
      }

      this.p.noStroke();
      this.p.angleMode(this.p.DEGREES);

      const whiteStarHsba = this.isFinalGlyph
          ? Array(0, 0, 100, (0.9 + this.pulseAmount * 0.1) * this.opacityMultiplier)
          : Array(0, 0, 100, 0.4 * this.opacityMultiplier);

      this.star3D(whiteStarHsba, this.positions);

      this.p.noStroke();
      if (this.isFinalGlyph) {
          const octagonColorIndex = Math.floor(this.colorPhase / 20) % this.p.colourSet.length;
          const octagonColor = this.p.colourSet[octagonColorIndex];

          this.p.fill(
              this.p.hue(octagonColor),
              this.p.saturation(octagonColor),
              this.p.brightness(octagonColor),
              (0.7 + this.pulseAmount * 0.3) * this.opacityMultiplier
          );
      } else {
          this.p.fill(
              this.hueDegree,
              100,
              100,
              1
          );
      }

      const octagonRadius = this.width / 3;
      const octagonTubeRadius = octagonRadius * 0.1;
      this.p.torus(octagonRadius, octagonTubeRadius, 8, 16);

      this.p.noStroke();
      this.p.angleMode(this.p.DEGREES);
      this.p.translate(this.center, this.center, 0);

      if (this.isFinalGlyph) {
          this.p.rotateZ(this.p.radians(this.hueDegree + this.starRotation));
      } else {
          this.p.rotateZ(this.p.radians(this.hueDegree));
      }

      const hsba = this.isFinalGlyph
          ? Array(this.hueDegree, 100, 100, (0.8 + this.pulseAmount * 0.2) * this.opacityMultiplier)
          : Array(this.hueDegree, 100, 100, this.hueTrans * this.opacityMultiplier);

      this.star3D(hsba, this.positions, this.isFinalGlyph ? 2 : 3);

      this.p.rotateZ(-this.p.radians(this.isFinalGlyph ? this.hueDegree + this.starRotation : this.hueDegree));
      this.p.translate(-this.center, -this.center, 0);

      if (this.isFinalGlyph) {
          this.p.noFill();
          for (let i = 0; i < 5; i++) {
              const glowColorIndex = (Math.floor(this.colorPhase / 10) + i) % this.p.colourSet.length;
              const glowColor = this.p.colourSet[glowColorIndex];

              this.p.stroke(
                  this.p.hue(glowColor),
                  this.p.saturation(glowColor),
                  this.p.brightness(glowColor),
                  0.2 - (i * 0.04)
              );
              this.p.strokeWeight(2);

              const glowSize = this.width * (1 + (i * 0.1)) * (1 + this.pulseAmount * 0.1);
              this.p.push();
              this.p.translate(this.center, this.center, 0);
              this.p.sphere(glowSize / 2, 16, 16);
              this.p.pop();
          }
      }

      this.p.pop();
  }

  star3D(hsba, positions, sizeReducer = 1) {
      this.p.fill(hsba[0], hsba[1], hsba[2], hsba[3]);
      const triangleDepth = this.depth * 0.3;
      const scaleFactor = 1.5;

      for(let i = 0; i < 8; i++){
          const x1 = (positions['x1'][i] / sizeReducer) * scaleFactor;
          const y1 = (positions['y1'][i] / sizeReducer) * scaleFactor;
          const x2 = (positions['x2'][i] / sizeReducer) * scaleFactor;
          const y2 = (positions['y2'][i] / sizeReducer) * scaleFactor;
          const x3 = (positions['x3'][i] / sizeReducer) * scaleFactor;
          const y3 = (positions['y3'][i] / sizeReducer) * scaleFactor;

          // Add tiny z-offset to each triangle to prevent z-fighting at center
          const centerZOffset = (i * 0.001) - 0.0035; // Small offset per triangle
          this.p.push();
          this.p.translate(0, 0, centerZOffset);
          this.drawTriangle3D(x1, y1, x2, y2, x3, y3, triangleDepth);
          this.p.pop();
      }
  }
}
