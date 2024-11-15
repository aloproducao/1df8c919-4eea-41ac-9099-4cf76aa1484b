import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Grip, Trash2, Play, Clock } from 'lucide-react';
import { Button } from './Button';
import { PlaylistItem } from './VideoPlayer';
import { cn } from '../lib/utils';
import { formatDuration } from '../lib/utils';

interface PlaylistQueueProps {
  playlist: PlaylistItem[];
  currentIndex: number;
  onReorder: (startIndex: number, endIndex: number) => void;
  onRemove: (index: number) => void;
  currentTime?: number;
}

export function PlaylistQueue({ playlist, currentIndex, onReorder, onRemove, currentTime = 0 }: PlaylistQueueProps) {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    onReorder(result.source.index, result.destination.index);
  };

  const calculateTimeInfo = (index: number) => {
    const totalDuration = playlist.reduce((total, item) => total + item.duration, 0);
    let elapsedTime = 0;
    
    // Calculate elapsed time up to this item
    for (let i = 0; i < index; i++) {
      elapsedTime += playlist[i].duration;
    }

    // For current playing item, add current time
    if (index === currentIndex) {
      elapsedTime += currentTime;
    }

    // Calculate remaining time
    const remainingTime = totalDuration - elapsedTime;

    return {
      elapsed: formatDuration(elapsedTime),
      remaining: `-${formatDuration(remainingTime)}`,
    };
  };

  return (
    <div className="space-y-3">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="playlist">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {playlist.map((item, index) => {
                const timeInfo = calculateTimeInfo(index);
                return (
                  <Draggable
                    key={index}
                    draggableId={`item-${index}`}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={cn(
                          'group flex items-center space-x-3 p-3 rounded-lg transition-all',
                          'border border-slate-200 dark:border-slate-700',
                          'hover:bg-slate-50 dark:hover:bg-slate-700/50',
                          index === currentIndex ? [
                            'bg-slate-100 dark:bg-slate-700',
                            'border-slate-300 dark:border-slate-600',
                            'shadow-sm'
                          ] : [
                            'bg-white dark:bg-slate-800'
                          ]
                        )}
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                          <Grip className="w-4 h-4" />
                        </div>
                        {index === currentIndex && (
                          <div className="flex-shrink-0">
                            <Play className="w-4 h-4 text-emerald-500 animate-pulse" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm font-medium truncate",
                            index === currentIndex
                              ? "text-slate-900 dark:text-slate-100"
                              : "text-slate-600 dark:text-slate-300"
                          )}>
                            {item.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                              {formatDuration(item.duration)}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                              {item.format.toUpperCase()}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                              <Clock className="w-3 h-3" />
                              {timeInfo.elapsed}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                              <Clock className="w-3 h-3" />
                              {timeInfo.remaining}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="danger"
                          onClick={() => onRemove(index)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5"
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      {playlist.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nenhum vídeo na lista de reprodução
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Arraste e solte vídeos aqui ou use o botão "Upload"
          </p>
        </div>
      )}
    </div>
  );
}