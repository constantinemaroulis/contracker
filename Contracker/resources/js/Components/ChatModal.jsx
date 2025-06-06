import Modal from '@/Components/Modal';
import ChatInput from '@/Components/ChatInput';
import ChatMessages from '@/Components/ChatMessages';

export default function ChatModal({ show, onClose, device }) {
    if (!device) {
        return null;
    }

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Chat with {device.name || device.uuid}
                </h2>

                <div className="mt-4 h-64 overflow-y-auto rounded-md border border-gray-300 p-4 dark:border-gray-600">
                    <ChatMessages uuid={device.uuid} />
                </div>

                <div className="mt-4">
                    <ChatInput uuid={device.uuid} />
                </div>
            </div>
        </Modal>
    );
}