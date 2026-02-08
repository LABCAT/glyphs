export default class LABCATGlyph3D {
  constructor(p5, x, y, z, width, shouldGrow = false) {
      this.p = p5;
      this.x = x;
      this.y = y;
      this.z = z;
      this.rotationX = this.p.random(0, 360);
      this.rotationY = this.p.random(0, 360);
      this.rotationZ = this.p.random(0, 360);

      this.shouldGrow = shouldGrow;
      this.width = shouldGrow ? 0 : width;

      this.center = this.width / 2;
      this.opacityMultiplier = 0;
      this.setRandomColour();
      this.update();
  }

  setRandomColour() {
      const hue = Math.floor(Math.random() * 360);
      const saturation = Math.floor(Math.random() * 20) + 80;
      const brightness = Math.floor(Math.random() * 40) + 50;
      const randomColour = this.p.color(hue, saturation, brightness);
      this.hsbColour = [
          this.p.hue(randomColour),
          this.p.saturation(randomColour),
          this.p.brightness(randomColour)
      ];

      this.hueDegree = this.hsbColour[0];
      this.brightnessTrans = this.p.map(this.hsbColour[2], 0, 100, 0.8, 0);
      this.hueTrans = this.p.map(this.hsbColour[2], 100, 0, 0.9, 0.1);
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
              this.circleSize/3,
          ],
          'depth' : [
              this.depth * 0.3,
              this.depth * 0.2,
              this.depth * 0.1,
          ]
      }

      this.horiVertMin = this.p.map(this.hueDegree, 0, 179, this.center, 0);
      this.horiVertMax = this.p.map(this.hueDegree, 0, 179, this.center, this.width);
      if(this.hueDegree > 179) {
          this.horiVertMin = 0;
          this.horiVertMax = this.width;
      }

      this.diagonalMin = this.p.map(this.hueDegree, 359, 180, (0 + this.width/8 + this.width/32), this.center);
      this.diagonalMax = this.p.map(this.hueDegree, 359, 180, (this.width - this.width/8 - this.width/32), this.center);

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

      this.p.noStroke();
      const torusIndices = [0, 2];
      for(let idx of torusIndices){
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

          const torusRadius = this.satCircles['size'][idx] / 2;
          const tubeRadius = torusRadius * 0.1;
          this.p.torus(torusRadius, tubeRadius, 16, 16);
      }

      this.p.noStroke();
      this.p.angleMode(this.p.DEGREES);

      const whiteStarHsba = Array(0, 0, 100, 0.4 * this.opacityMultiplier);

      this.star3D(whiteStarHsba, this.positions);

      this.p.noStroke();
      this.p.fill(
          this.hueDegree,
          100,
          100,
          1
      );

      const octagonRadius = this.width / 3;
      const octagonTubeRadius = octagonRadius * 0.1;
      this.p.torus(octagonRadius, octagonTubeRadius, 8, 16);

      this.p.noStroke();
      this.p.angleMode(this.p.DEGREES);
      this.p.translate(this.center, this.center, 0);

      this.p.rotateZ(this.p.radians(this.hueDegree));

      const hsba = Array(this.hueDegree, 100, 100, this.hueTrans * this.opacityMultiplier);

      this.star3D(hsba, this.positions, 3);

      this.p.rotateZ(-this.p.radians(this.hueDegree));
      this.p.translate(-this.center, -this.center, 0);

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
