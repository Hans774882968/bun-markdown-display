import { LogLevel } from '../framework/live2dcubismframework';
export const CanvasSize = 'auto';
export const CanvasNum = 1;
export const ViewScale = 1.0;
export const ViewMaxScale = 2.0;
export const ViewMinScale = 0.8;
export const ViewLogicalLeft = -1.0;
export const ViewLogicalRight = 1.0;
export const ViewLogicalBottom = -1.0;
export const ViewLogicalTop = 1.0;
export const ViewLogicalMaxLeft = -2.0;
export const ViewLogicalMaxRight = 2.0;
export const ViewLogicalMaxBottom = -2.0;
export const ViewLogicalMaxTop = 2.0;
export const ResourcesPath = '../../Resources/';
export const BackImageName = 'back_class_normal.png';
export const GearImageName = 'icon_gear.png';
export const PowerImageName = 'CloseNormal.png';
export const ModelDir = [
    'Haru',
    'Hiyori',
    'Mark',
    'Natori',
    'Rice',
    'Mao',
    'Wanko'
];
export const ModelDirSize = ModelDir.length;
export const MotionGroupIdle = 'Idle';
export const MotionGroupTapBody = 'TapBody';
export const HitAreaNameHead = 'Head';
export const HitAreaNameBody = 'Body';
export const PriorityNone = 0;
export const PriorityIdle = 1;
export const PriorityNormal = 2;
export const PriorityForce = 3;
export const MOCConsistencyValidationEnable = true;
export const MotionConsistencyValidationEnable = true;
export const DebugLogEnable = true;
export const DebugTouchLogEnable = false;
export const CubismLoggingLevel = LogLevel.LogLevel_Verbose;
export const RenderTargetWidth = 1900;
export const RenderTargetHeight = 1000;
