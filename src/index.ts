import { StanfordDiagramController } from './stanford-diagram.controller';
import { stanfordDiagramPlugin } from './stanford-diagram.plugin';
import { registry } from 'chart.js';

registry.addControllers(StanfordDiagramController);

export { stanfordDiagramPlugin, StanfordDiagramController };
