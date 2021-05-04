<template>
  <div class="vtk-cone" ref="vtkDiv">
    
  </div>
</template>

<script>
import 'vtk.js/Sources/favicon';

import vtkPoints from 'vtk.js/Sources/Common/Core/Points';
import vtkMath from 'vtk.js/Sources/Common/Core/Math';
import vtkPolyData from 'vtk.js/Sources/Common/DataModel/PolyData';

import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkConeSource from 'vtk.js/Sources/Filters/Sources/ConeSource';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import vtkOpenGLRenderWindow from 'vtk.js/Sources/Rendering/OpenGL/RenderWindow';
import vtkRenderWindow from 'vtk.js/Sources/Rendering/Core/RenderWindow';
import vtkRenderWindowInteractor from 'vtk.js/Sources/Rendering/Core/RenderWindowInteractor';
import vtkRenderer from 'vtk.js/Sources/Rendering/Core/Renderer';
import vtkInteractorStyleTrackballCamera from 'vtk.js/Sources/Interaction/Style/InteractorStyleTrackballCamera';

export default {
  name: 'VtkTest',
  mounted() {

    // Create a grid of points (height/terrian map)
    var pointsArray = new Array();
    var gridSize = 50;
    var xx, yy, zz;
    for (var x = 0; x < gridSize; x++) {
      for (var y = 0; y < gridSize; y++) {
        xx = x + vtkMath.random(-.2, .2);
        yy = y + vtkMath.random(-.2, .2);
        zz = vtkMath.random(-4, 4);
        pointsArray.push(vtkPoints.newInstance(xx, yy, zz));
      }
    }

    // Add the grid points to a polydata object
    var inputPolyData = vtkPolyData.newInstance().setPoints(pointsArray);
    vtkPolyData.newInstance().
    // Triangulate the grid points 

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>