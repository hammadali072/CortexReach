import { useState } from 'react';
import toast from 'react-hot-toast';

export const useFollowUp = () => {
    const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [selectedCampaignId, setSelectedCampaignId] = useState(null);
    const [eligibleCount, setEligibleCount] = useState(0);

    const openFollowUpModal = (campaignId, repliedCount) => {
        setSelectedCampaignId(campaignId);
        setEligibleCount(repliedCount);
        setSubject('');
        setBody('');
        setIsFollowUpModalOpen(true);
    };

    const closeFollowUpModal = () => {
        setIsFollowUpModalOpen(false);
        setSelectedCampaignId(null);
        setEligibleCount(0);
        setSubject('');
        setBody('');
    };

    const handleSendFollowUp = async (onSuccess) => {
        if (!subject.trim() || !body.trim() || body.trim() === '<p><br></p>') {
            toast.error('Subject and body are required.');
            return;
        }

        setIsSending(true);
        try {
            const res = await fetch('/api/send-followup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaignId: selectedCampaignId,
                    subject,
                    body,
                }),
            });
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || 'Failed to send follow-up');
            }

            toast.success(`Follow-up sent successfully to ${data.totalSent} leads!`);
            closeFollowUpModal();
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error('[send-followup error]', err);
            toast.error(err.message || 'Error occurred while sending follow-up');
        } finally {
            setIsSending(false);
        }
    };

    return {
        isFollowUpModalOpen,
        isSending,
        subject,
        setSubject,
        body,
        setBody,
        eligibleCount,
        openFollowUpModal,
        closeFollowUpModal,
        handleSendFollowUp
    };
};
