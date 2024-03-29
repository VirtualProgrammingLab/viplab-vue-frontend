import DataSet from './gridplot/DataSet';

export default function Parse(viplabFile) {
  this.file = viplabFile;

  // set min and max as Arrays: Will be Arrays of Strings representing rgb-values
  this.min = [];
  this.max = [];

  this.outputFile = function () {
    console.log(this.file);
  };

  this.parseFileToJson = function () {
    return JSON.parse(this.file.replace(/\n/g, '\\n'));
  };

  this.parseValues = function (json) {
    const value = json.value.split('\n');

    let width = 0; let
      height = 0; // Dimensions of the array.
    let xmin = 0.0; let ymin = 0.0; let xmax = 0.0; let
      ymax = 0.0; // range on the screen
    let xscale = 1.0; let yscale = 1.0; let
      zscale = 1.0; // scaling factors

    const datasetList = [];
    let dataset = null;

    let label = null;
    let time = 0.0;

    let cmin = null;
    let cmax = null;

    // this.min = new ArrayList<Color>();
    // this.max = new ArrayList<Color>();

    const valueArray = [];

    // get all values (starting at i = 1, such that the Plot-type isn't included) and convert them to array of array
    for (let i = 1; i < value.length; i += 1) {
      if (value[i] != null && (!(value[i] === '\n')) && (!(value[i].startsWith('##')))) {
        if (value[i].startsWith('#')) {
          const splitLine = value[i].split(' ');

          // start new dataset
          dataset = null;

          switch (splitLine[1].toLowerCase()) {
            case 'x-range':
              [, , xmin, xmax] = splitLine;
              break;
            case 'y-range':
              [, , ymin, ymax] = splitLine;
              break;
            case 'x-count':
              [, , width] = splitLine;
              break;
            case 'y-count':
              [, , height] = splitLine;
              break;
            case 'min-color': {
              const [, , r1, g1, b1] = splitLine;
              cmin = `rgb(${r1}, ${g1}, ${b1})`;
              break;
            }
            case 'max-color': {
              const [, , r2, g2, b2] = splitLine;
              cmax = `rgb(${r2}, ${g2}, ${b2})`;
              break;
            }
            case 'scale':
              [, , xscale, yscale, zscale] = splitLine;
              break;
            case 'time':
              [, , time] = splitLine;
              break;
            case 'label':
              label = splitLine.splice(2, splitLine.length).join(' ');
              break;
            default:
              console.log('default case');
          }
        }
        // parse values ant put them into valueArray
        if (!value[i].startsWith('#') && value[i].length > 0) {
          if (width <= 1 || height <= 1) {
            // throw new IOException("invalid input format, width and height of the array are missing");
            console.log('invalid input format, width and height of the array are missing');
          }
          if (xmax <= xmin || ymax <= ymin) {
            // throw new IOException("invalid input format, plot range is zero or negative");
            console.log('invalid input format, plot range is zero or negative');
          }

          if (dataset === null) {
            dataset = new DataSet.DataSet(width, height, xmin, xmax, ymin, ymax, time, label);
            datasetList.push(dataset);
            this.min.push(cmin);
            this.max.push(cmax);
            cmin = null;
            cmax = null;
          }
          valueArray.push(JSON.parse(`[${value[i].trim().replace(/ /g, ', ')}]`));
          for (let idx = 0; idx < valueArray[valueArray.length - 1].length; idx += 1) {
            const z = valueArray[valueArray.length - 1][idx];
            valueArray[valueArray.length - 1][idx] = z * zscale;
          }
          dataset.getData().push(valueArray[valueArray.length - 1]);
        }
      }
    }
    console.log(`Set: ${width} ${height} ${xmin} ${ymin} ${xmax} ${ymax} ${xscale} ${yscale} ${zscale} ${datasetList} ${dataset} ${label} ${time} ${cmin} ${cmax}`);

    // console.log(datasetList);
    return datasetList;
  };

  // Return minimum and maximum color.
  this.getMinColor = function () {
    return this.min;
  };

  this.getMaxColor = function () {
    return this.max;
  };
}
