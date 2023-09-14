import cn from "classnames";
import { useStore } from "effector-react";
import { FC, memo, ReactElement, useEffect, useState } from "react";
import { fmtLevelNumber } from "components/levelset";
import {
  DiffItem,
  DiffItemValue,
  FancyTiles,
  getDriver,
  IBaseLevel,
  TileRenderProps,
} from "drivers";
import {
  $diffCanZoomIn,
  $diffCanZoomOut,
  $diffFancyIgnore,
  $diffSide,
  $diffTileShape,
  $diffZoom,
  diffFancyToggle,
  diffSetSide,
  diffSetTileShape,
  DiffTileShape,
  diffZoomIn,
  diffZoomOut,
} from "models/levels/cmp";
import {
  $cmpLevelFirstTitle,
  $cmpLevelHasFirst,
  $cmpLevels,
  $hasCmpLevelsRefs,
  closeCmpLevels,
  CmpEntry,
  cmpLevelToggle,
  swapCmpLevels,
} from "models/levelsets";
import { Button, ButtonDropdown, Toolbar, ToolbarSeparator } from "ui/button";
import { Dialog, DiffValue, Spinner } from "ui/feedback";
import { IconContainer, svgs } from "ui/icon";
import { Checkbox, Range } from "ui/input";
import { ColorType, ContainerProps } from "ui/types";
import { clipRect, IBounds, Rect } from "utils/rect";
import { rectDiff, RectDiffResult } from "utils/rect-diff/rectDiff";
import cl from "./CmpLevels.module.scss";

export const CmpLevelsButton: FC = () => (
  <>
    <Button
      icon={<svgs.Cmp />}
      uiColor={useStore($cmpLevelHasFirst) ? ColorType.SUCCESS : undefined}
      title={useStore($cmpLevelFirstTitle)}
      onClick={cmpLevelToggle}
    />
    <CmpLevelsDialog />
  </>
);

const CmpLevelsDialog: FC = () => (
  <Dialog
    open={useStore($hasCmpLevelsRefs)}
    onClose={closeCmpLevels}
    title="Compare levels"
    size="fullscreen"
  >
    <CmpLevels />
  </Dialog>
);

const CmpLevels: FC = () => {
  const [first, second] = useStore($cmpLevels)!;
  return (
    <div className={cl.root}>
      <CmpHeading first={first} second={second} />
      <CmpBodies first={first} second={second} />
      <CmpFooters first={first} second={second} />
    </div>
  );
};

interface _P {
  first: CmpEntry;
  second: CmpEntry;
}

// ------------------------------------------------------

const SHAPES = [
  { shape: DiffTileShape.DIAGONAL, label: "Diagonal" },
  { shape: DiffTileShape.HORIZONTAL, label: "Horizontal" },
  { shape: DiffTileShape.VERTICAL, label: "Vertical" },
  { shape: DiffTileShape.FADE, label: "Fade" },
];
const formatPercent = (n: number) => `${n}%`;
const CmpHeading: FC<_P> = ({ first, second }) => {
  const canZoomOut = useStore($diffCanZoomOut);
  const canZoomIn = useStore($diffCanZoomIn);
  const fancyIgnore = useStore($diffFancyIgnore);
  const tileShape = useStore($diffTileShape);
  const side = useStore($diffSide);
  return (
    <div className={cl.headers}>
      <div className={cl.refs}>
        {[
          { title: "A", entry: first, cls: cl.first },
          { title: "B", entry: second, cls: cl.second },
        ].map(({ title, entry: { file, index, level }, cls }, i) => (
          <div key={i} className={cls}>
            <span>{title}</span>
            <span>{file.name}</span>
            <span className={cl.numeric}>
              {fmtLevelNumber(index, String(file.levelset.levelsCount).length)}
            </span>
            <span className={cl.title}>{level.title}</span>
          </div>
        ))}
      </div>
      <Toolbar className={cl.end}>
        <Button icon={<svgs.SwapVertical />} onClick={swapCmpLevels}>
          Reverse
        </Button>
        <ToolbarSeparator />
        <Button
          icon={<svgs.MinusSquare />}
          title="Zoom Out"
          onClick={diffZoomOut}
          disabled={!canZoomOut}
        />
        <Button
          icon={<svgs.PlusSquare />}
          title="Zoom In"
          onClick={diffZoomIn}
          disabled={!canZoomIn}
        />
        <ToolbarSeparator />
        <Checkbox checked={fancyIgnore} onChange={diffFancyToggle}>
          Ignore Fancy
        </Checkbox>
        <ButtonDropdown
          trigger="Shape"
          triggerIcon={<svgs.CheckboxUnchecked />}
        >
          <Toolbar isMenu>
            {SHAPES.map(({ shape, label }) => (
              <Button
                key={shape}
                uiColor={
                  shape === tileShape ? ColorType.PRIMARY : ColorType.MUTE
                }
                onClick={() => diffSetTileShape(shape)}
              >
                {label}
              </Button>
            ))}
          </Toolbar>
        </ButtonDropdown>
        <Range
          min={0}
          max={100}
          value={side}
          onChange={diffSetSide}
          format={formatPercent}
        />
      </Toolbar>
    </div>
  );
};

// ------------------------------------------------------

const CmpBodies: FC<_P> = ({ first, second }) => {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<RectDiffResult>();
  const [error, setError] = useState<Error>();
  useEffect(() => {
    setPending(true);
    let p: Promise<unknown> | null = new Promise<RectDiffResult>(
      (resolve, reject) => {
        const a = first.file;
        const b = second.file;
        if (a.driverName !== b.driverName) {
          return reject(new Error("Different file drivers"));
        }
        const { borderTiles, fancyTiles } = getDriver(a.driverName)!;

        resolve(
          rectDiff({
            first: first.level,
            second: second.level,
            borderTiles,
            similarTiles: fancyTiles,
          }),
        );
      },
    )
      .then(
        (result) => {
          if (p) {
            setResult(result);
          }
        },
        (e) => {
          if (p) {
            setError(e);
          }
        },
      )
      .finally(() => setPending(false));

    return () => {
      p = null;
      setPending(false);
    };
  }, [first, second]);

  const zoom = useStore($diffZoom);
  const fancyIgnore = useStore($diffFancyIgnore);
  const tileShape = useStore($diffTileShape);
  const side = useStore($diffSide);

  return (
    <div className={cl.bodies}>
      {error ? (
        <div className={cl.error}>
          <IconContainer>
            <svgs.Warning />
          </IconContainer>{" "}
          {error.message}
        </div>
      ) : pending ? (
        <div className={cl.pending}>
          <Spinner inline /> Calculating...
        </div>
      ) : result ? (
        <Result
          first={first.level}
          second={second.level}
          driverName={first.file.driverName}
          result={result}
          zoom={zoom}
          ignoreFancy={fancyIgnore}
          tileShape={tileShape}
          side={side}
        />
      ) : null}
    </div>
  );
};

const CL_TILE_SHAPE: Record<DiffTileShape, string> = {
  [DiffTileShape.DIAGONAL]: cl._diagonal,
  [DiffTileShape.HORIZONTAL]: cl._horizontal,
  [DiffTileShape.VERTICAL]: cl._vertical,
  [DiffTileShape.FADE]: cl._fade,
};
const Result = memo<{
  first: IBaseLevel;
  second: IBaseLevel;
  driverName: string;
  result: RectDiffResult;
  zoom: number;
  ignoreFancy: boolean;
  tileShape: DiffTileShape;
  side: number;
}>(
  ({
    first: A,
    second: B,
    driverName,
    result: { firstAt: aAt, secondAt: bAt, area },
    zoom,
    ignoreFancy,
    tileShape,
    side,
  }) => {
    const { TileRender, fancyTiles } = getDriver(driverName)!;

    // ==================
    // ----->
    //    ============
    //    -->
    // <<<<<<>>>>>>>>>>>>
    //
    const totalWidth =
      Math.max(aAt.x, bAt.x) + Math.max(A.width - aAt.x, B.width - bAt.x);
    const totalHeight =
      Math.max(aAt.y, bAt.y) + Math.max(A.height - aAt.y, B.height - bAt.y);

    const [ax0, bx0] = aAt.x >= bAt.x ? [0, aAt.x - bAt.x] : [bAt.x - aAt.x, 0];
    const [ay0, by0] = aAt.y >= bAt.y ? [0, aAt.y - bAt.y] : [bAt.y - aAt.y, 0];

    const insideA = clipRect(
      {
        x: -ax0 + bx0,
        y: -ay0 + by0,
        width: B.width,
        height: B.height,
      },
      A,
    );

    return (
      <div className={cl.result}>
        <div className={cl.scroll}>
          <div
            className={cn(cl.canvas, CL_TILE_SHAPE[tileShape])}
            style={
              {
                "--tw": totalWidth,
                "--th": totalHeight,
                "--size": `${zoom}px`,
                "--diff-side": side / 100,
              } as {}
            }
          >
            {/* top outside full rows */}
            {by0 > 0 ? (
              <OutsideTiles
                level={A}
                TileRender={TileRender}
                offsetX={ax0}
                rect={{ x: 0, y: 0, width: A.width, height: by0 }}
              />
            ) : (
              <OutsideTiles
                level={B}
                TileRender={TileRender}
                offsetX={bx0}
                rect={{ x: 0, y: 0, width: B.width, height: ay0 }}
              />
            )}

            {/* left outside sub rows */}
            {bx0 > 0 ? (
              <OutsideTiles
                level={A}
                TileRender={TileRender}
                offsetY={ay0}
                rect={{
                  x: 0,
                  y: 0,
                  width: bx0,
                  height:
                    ay0 + A.height > by0 + B.height
                      ? -ay0 + by0 + B.height
                      : A.height,
                }}
              />
            ) : (
              <OutsideTiles
                level={B}
                TileRender={TileRender}
                offsetY={by0}
                rect={{
                  x: 0,
                  y: 0,
                  width: ax0,
                  height:
                    by0 + B.height > ay0 + A.height
                      ? -by0 + ay0 + A.height
                      : B.height,
                }}
              />
            )}

            {/* bottom outside full rows */}
            {ay0 + A.height > by0 + B.height ? (
              <OutsideTiles
                level={A}
                TileRender={TileRender}
                offsetX={ax0}
                offsetY={ay0}
                rect={{
                  x: 0,
                  y: -ay0 + by0 + B.height,
                  width: A.width,
                  height: A.height,
                }}
              />
            ) : (
              <OutsideTiles
                level={B}
                TileRender={TileRender}
                offsetX={bx0}
                offsetY={by0}
                rect={{
                  x: 0,
                  y: -by0 + ay0 + A.height,
                  width: B.width,
                  height: B.height,
                }}
              />
            )}

            {/* right outside sub rows */}
            {ax0 + A.width > bx0 + B.width ? (
              <OutsideTiles
                level={A}
                TileRender={TileRender}
                offsetX={ax0}
                offsetY={ay0}
                rect={{
                  x: -ax0 + bx0 + B.width,
                  y: by0 > 0 ? by0 : 0,
                  width: A.width,
                  height:
                    by0 + B.height > ay0 + A.height
                      ? -by0 + ay0 + A.height
                      : B.height,
                }}
              />
            ) : (
              <OutsideTiles
                level={B}
                TileRender={TileRender}
                offsetX={bx0}
                offsetY={by0}
                rect={{
                  x: -bx0 + ax0 + A.width,
                  y: ay0 > 0 ? ay0 : 0,
                  width: B.width,
                  height:
                    ay0 + A.height > by0 + B.height
                      ? -ay0 + by0 + B.height
                      : A.height,
                }}
              />
            )}

            <InsideTiles
              width={insideA.width}
              height={insideA.height}
              firstX={ax0}
              firstY={ay0}
              secondX={bx0}
              secondY={by0}
              first={A}
              second={B}
              TileRender={TileRender}
              fancyTiles={ignoreFancy ? fancyTiles : undefined}
            />

            <Frame
              x={ax0}
              y={ay0}
              width={A.width}
              height={A.height}
              className={cl._first}
            />
            <Frame
              x={bx0}
              y={by0}
              width={B.width}
              height={B.height}
              className={cl._second}
            />
            <Frame
              x={ax0 + area.x}
              y={ay0 + area.y}
              width={area.width}
              height={area.height}
              className={cl._area}
            />
          </div>
        </div>
      </div>
    );
  },
);

const Frame: FC<Rect & ContainerProps> = ({
  x,
  y,
  width,
  height,
  className,
}) => (
  <div
    className={cn(cl.frame, className)}
    style={
      {
        "--x": x,
        "--y": y,
        "--w": width,
        "--h": height,
      } as {}
    }
  />
);

const OutsideTiles: FC<{
  level: IBaseLevel;
  rect: Rect;
  TileRender: FC<TileRenderProps>;
  offsetX?: number;
  offsetY?: number;
}> = ({ level, rect, TileRender, offsetX = 0, offsetY = 0 }) => {
  const { x, y, width, height } = clipRect(rect, level);
  const nodes: ReactElement[] = [];
  for (const [i, j, w, tile, v] of level.tilesRenderStream(
    x,
    y,
    width,
    height,
  )) {
    const cx = offsetX + i;
    const cy = offsetY + j;
    nodes.push(
      <TileRender
        key={`${cx};${cy}`}
        tile={tile}
        variant={v}
        className={cl.tileE}
        style={{ "--x": cx, "--y": cy, "--w": w } as {}}
      />,
    );
  }
  return nodes.length ? <>{nodes}</> : null;
};

const InsideTiles: FC<
  IBounds & {
    firstX: number;
    firstY: number;
    secondX: number;
    secondY: number;
    first: IBaseLevel;
    second: IBaseLevel;
    TileRender: FC<TileRenderProps>;
    fancyTiles?: FancyTiles;
  }
> = ({
  width,
  height,
  firstX,
  firstY,
  secondX,
  secondY,
  first,
  second,
  TileRender,
  fancyTiles,
}) => {
  const x0 = Math.max(firstX, secondX);
  const y0 = Math.max(firstY, secondY);
  const ax0 = secondX;
  const ay0 = secondY;
  const bx0 = firstX;
  const by0 = firstY;
  const unfancy = fancyTiles
    ? (tile: number) => fancyTiles.get(tile) ?? tile
    : Number;
  const nodes: ReactElement[] = [];
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      const aTile = first.getTile(ax0 + i, ay0 + j);
      const bTile = second.getTile(bx0 + i, by0 + j);
      const isSame = unfancy(aTile) === unfancy(bTile);
      const cx = x0 + i;
      const cy = y0 + j;
      nodes.push(
        <TileRender
          key={`${cx};${cy}`}
          tile={aTile}
          className={isSame ? cl.tileE : cl.tileA}
          style={{ "--x": cx, "--y": cy } as {}}
        />,
      );
      if (!isSame) {
        nodes.push(
          <TileRender
            key={`${cx};${cy}b`}
            tile={bTile}
            className={cl.tileB}
            style={{ "--x": cx, "--y": cy } as {}}
          />,
        );
      }
    }
  }
  return nodes.length ? <>{nodes}</> : null;
};

// ------------------------------------------------------

const CmpFooters: FC<_P> = ({ first: A, second: B }) => {
  let diff: DiffItem[] = [];
  if (A.level.title !== B.level.title) {
    diff.push({
      label: "Title",
      a: (
        <DiffValue different side={0}>
          <code>{A.level.title}</code>
        </DiffValue>
      ),
      b: (
        <DiffValue different side={1}>
          <code>{B.level.title}</code>
        </DiffValue>
      ),
    });
  }
  if (A.level.width !== B.level.width) {
    diff.push({
      label: "Width",
      a: A.level.width,
      b: B.level.width,
    });
  }
  if (A.level.height !== B.level.height) {
    diff.push({
      label: "Height",
      a: A.level.height,
      b: B.level.height,
    });
  }

  if (A.file.driverName !== B.file.driverName) {
    diff.push({
      label: "Driver",
      a: A.file.driverName,
      b: B.file.driverName,
    });
  } else {
    const { cmpLevels } = getDriver(A.file.driverName)!;
    if (cmpLevels) {
      diff = [...diff, ...cmpLevels(A.level, B.level)];
    }
  }

  return (
    <div className={cl.footers}>
      <table>
        <thead>
          <tr>
            <th>Property</th>
            <th>
              <del>A</del>
            </th>
            <th>
              <ins>B</ins>
            </th>
          </tr>
        </thead>
        <tbody>
          {diff.map(({ label, a, b }, i) => (
            <tr key={i}>
              <th>{label}</th>
              <td>{renderValue(a, 0)}</td>
              <td>{renderValue(b, 1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const renderValue = (
  value: DiffItemValue | undefined,
  side: 0 | 1,
): ReactElement => {
  const [node, done] = renderValueNode(value);
  if (done) {
    return node;
  }
  return (
    <DiffValue different side={side}>
      {node}
    </DiffValue>
  );
};
const renderValueNode = (
  value: DiffItemValue | undefined,
): [ReactElement, true?] => {
  switch (value) {
    case undefined:
      return [<div className={cl.undef}>N/A</div>];
    case null:
      return [<div className={cl.null}>null</div>];
    case false:
    case true:
      return [
        <div className={cl.bool}>
          <b>{String(value)}</b>
        </div>,
      ];
  }
  switch (typeof value) {
    case "number":
      return [<div className={cl.num}>{value}</div>];
    case "string":
      return [<>{value}</>];
  }
  return [value, true];
};
