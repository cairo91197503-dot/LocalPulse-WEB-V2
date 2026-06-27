const fs = require('fs');

const code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

const startIndex = code.indexOf('{/* Metrics & Chart Section */}');
const endIndex = code.indexOf('{/* Sync Status Footer */}');

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find boundaries");
  process.exit(1);
}

const before = code.slice(0, startIndex);
const after = code.slice(endIndex);

let content = code.slice(startIndex, endIndex);

const metricsStart = content.indexOf('{/* Metrics & Chart Section */}');
const insightsStart = content.indexOf('{/* Smart Insights Card */}');
const connectionStart = content.indexOf('{/* Connection Card (Only show if NOT connected) */}');
const quickActionsStart = content.indexOf('<div className="tour-quick-actions grid grid-cols-1 md:grid-cols-2 gap-6">');
const quickTipsStart = content.indexOf('{/* Quick Tips Carousel */}');
const recentReviewsStart = content.indexOf('{/* Recent Reviews Section */}');

const metricsContent = content.slice(metricsStart, insightsStart);
let insightsContent = content.slice(insightsStart, connectionStart);
let connectionContent = content.slice(connectionStart, quickActionsStart);
const quickActionsContent = content.slice(quickActionsStart, quickTipsStart);
const quickTipsContent = content.slice(quickTipsStart, recentReviewsStart);
const recentReviewsContent = content.slice(recentReviewsStart);

function removeWrapping(text, condition) {
    let clean = text.trim();
    if (clean.startsWith(condition)) {
       clean = clean.substring(condition.length).trim();
       if (clean.startsWith('(')) {
           clean = clean.substring(1).trim();
       }
       if (clean.endsWith(')}')) {
           clean = clean.substring(0, clean.length - 2).trim();
       }
    }
    return clean;
}

insightsContent = removeWrapping(insightsContent, '{gmbConnected &&');
connectionContent = removeWrapping(connectionContent, '{!gmbConnected &&');


const newContent = `
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={layoutItems}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-8">
          {layoutItems.map((id) => {
            if (id === "metrics") return (
              <SortableItem key={id} id={id}>
                ${metricsContent.trim()}
              </SortableItem>
            );
            
            if (id === "insights") return gmbConnected ? (
              <SortableItem key={id} id={id}>
                ${insightsContent.trim()}
              </SortableItem>
            ) : null;
            
            if (id === "connection") return !gmbConnected ? (
              <SortableItem key={id} id={id}>
                ${connectionContent.trim()}
              </SortableItem>
            ) : null;
            
            if (id === "quick_actions") return (
              <SortableItem key={id} id={id}>
                ${quickActionsContent.trim()}
              </SortableItem>
            );
            
            if (id === "quick_tips") return (
              <SortableItem key={id} id={id}>
                ${quickTipsContent.trim()}
              </SortableItem>
            );
            
            if (id === "recent_reviews") return (
              <SortableItem key={id} id={id}>
                ${recentReviewsContent.trim()}
              </SortableItem>
            );

            return null;
          })}
          </div>
        </SortableContext>
      </DndContext>

      `;

fs.writeFileSync('src/pages/Dashboard.tsx', before + newContent + after);
console.log("Refactoring complete");
