import { Allotment } from 'allotment';
import 'allotment/dist/style.css';
import EmbeddedBrowser from '../browser/EmbeddedBrowser';
import ChatPanel from '../chat/ChatPanel';
import FlowchartPanel from '../flowchart/FlowchartPanel';

const ThreePanelLayout = () => {
    return (
        <div className="w-full h-full text-white">
            <Allotment>
                <Allotment.Pane minSize={200} preferredSize="30%">
                    <EmbeddedBrowser />
                </Allotment.Pane>

                <Allotment.Pane minSize={300} preferredSize="45%">
                    <FlowchartPanel />
                </Allotment.Pane>

                <Allotment.Pane minSize={200} preferredSize="25%">
                    <ChatPanel />
                </Allotment.Pane>
            </Allotment>
        </div>
    );
};

export default ThreePanelLayout;
