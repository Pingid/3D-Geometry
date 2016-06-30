Number.prototype.map = function (in_min, in_max, out_min, out_max) {
  return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function Sphere(origin, radius, ctx, detail) {
  this.origin = origin;
  this.radius = radius;
  this.detail = detail;
  this.points = [[]];
  this.rotation = [0, 0, 0];

  this.mapPoints = function(f) {
    return this.points.map(function(line) {
      return line.map(function(point) { return f(point) })
    })
  }
  this.generatePoints = function() {
    function make2dArray(len){
      var a = [];
      while(a.push([]) < len);
      return a;
    }
    var points = make2dArray(this.detail + 1)
    for(i = 0; i <= this.detail; i++) {
      var lon = i.map(0, this.detail, 0, (Math.PI * 2))
      for(j = 0; j <= this.detail; j++) {
        var lat = j.map(0, this.detail, 0, Math.PI)
        var x = this.radius * Math.cos(lon) * Math.sin(lat)
        var y = this.radius * Math.sin(lon) * Math.sin(lat)
        var z = this.radius * Math.cos(lat)
        points[i][j] = { x: x, y: y, z: z }
      }
    }
    this.points = points;
  }

  this.rotate = function(axes, theta){
    var sinTheta = Math.sin(theta);
    var cosTheta = Math.cos(theta);
    this.points = this.mapPoints(function(point) {
      var x = point.x,
          y = point.y,
          z = point.z;
      switch (axes) {
        case 'x':
          return { x: x, y: y * cosTheta - z * sinTheta, z: z * cosTheta + y * sinTheta };
        case 'y':
          return { x: x * cosTheta - z * sinTheta, y: y, z: z * cosTheta + x * sinTheta };
        case 'z':
          return { x: x * cosTheta - y * sinTheta, y: y * cosTheta + x * sinTheta, z: z };
        default:
          return point
      }
    });
  };

  this.updateRotation = function(){
    this.rotate('x', this.rotation[0]);
    this.rotate('y', this.rotation[1]);
    this.rotate('z', this.rotation[2]);
  };

  this.drawPoints = function(radius) {
    this.mapPoints(function(point) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'green';
      ctx.stroke();
    });
  }

  this.drawMesh = function() {
    function drawFace(nodes) {
      ctx.beginPath();
      ctx.moveTo(nodes[0].x, nodes[0].y)
      for(var i = 1; i < nodes.length; i++) {
        ctx.lineTo(nodes[i].x, nodes[i].y)
      }
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'white';
      ctx.stroke();
    }
    for (i = 0; i < this.points.length - 1; i ++) {
      for (j = 0; j < this.points.length - 1 ; j ++) {
        var p1 = this.points[i][j];
        var p2 = this.points[i + 1][j];
        var p3 = this.points[i][j + 1];
        drawFace([p1, p2, p3, p1])
      }
    }
  }

  this.update = function() {
    this.generatePoints()
    this.updateRotation()
    this.drawPoints(2)
    this.drawMesh(2)
  }
}
