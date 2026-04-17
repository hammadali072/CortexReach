import React, { useState, useEffect, useCallback } from 'react';
import TitleComponent from '../components/titleComponent/titleComponent';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { getUserCampaigns, getCampaignSendsStats } from '../services/db';
import { useFollowUp } from '../hooks/useFollowUp';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import RichTextEditor from '../components/ui/RichTextEditor';

const FollowUps = () => {
    const { currentUser } = useAuth();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    const {
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
    } = useFollowUp();

    const loadData = useCallback(async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const allCampaigns = await getUserCampaigns(currentUser.uid);
            const sentCampaigns = allCampaigns.filter(c => c.status === 'sent');

            const campaignsWithStats = await Promise.all(
                sentCampaigns.map(async (camp) => {
                    const stats = await getCampaignSendsStats(camp.id);
                    return { ...camp, stats };
                })
            );

            const followUpCampaigns = campaignsWithStats.filter(
                c => c.stats.replied > 0 || c.stats.followUpSent > 0
            );

            setCampaigns(followUpCampaigns);
        } catch (err) {
            console.error('[FollowUps] fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSuccess = () => {
        loadData();
    };

    return (
        <div className="min-h-screen space-y-8 pb-12 text-slate-900">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <TitleComponent type="h1" className="text-slate-900 text-3xl font-bold">
                        Follow-Ups
                    </TitleComponent>
                    <TitleComponent type="p" size="base" className="text-slate-500 mt-1">
                        Manage single-step follow-ups for leads who opened or replied to your initial email.
                    </TitleComponent>
                </div>
            </div>

            {/* Logical Rule Indicator */}
            <div className="p-6 bg-slate-900 rounded-lg text-white flex items-center gap-6 shadow-xl border border-slate-700">
                <div className="w-16 h-16 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <i className="fas fa-microchip text-2xl" />
                </div>
                <div>
                    <h3 className="font-bold text-lg">Automated Logic Enabled</h3>
                    <p className="text-slate-400 text-sm">System only prepares follow-ups for leads who have provided an 'Open' or 'Reply' signal. All other outreach is discarded.</p>
                </div>
            </div>

            {/* Follow-Ups List */}
            {loading ? (
                <div className="py-12 flex justify-center">
                    <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                </div>
            ) : campaigns.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-lg border border-slate-200">
                    <p className="text-slate-500 font-medium">No eligible follow-up campaigns found yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {campaigns.map((item) => {
                        const status = item.stats.followUpSent > 0 ? 'Sent' : 'Pending';
                        const conversion = item.stats.replied > 0
                            ? ((item.stats.followUpSent / item.stats.replied) * 100).toFixed(0) + '%'
                            : '0%';

                        return (
                            <div key={item.id} className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-bold text-xl">{item.name}</h4>
                                            <Badge variant={status === 'Sent' ? 'success' : 'warning'}>
                                                {status}
                                            </Badge>
                                        </div>
                                        <p className="text-slate-500 text-sm">Eligible for {item.stats.replied} replied leads.</p>
                                    </div>

                                    <div className="flex items-center gap-12">
                                        <div className="text-center">
                                            <p className="text-xl font-bold">{item.stats.replied}</p>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Eligible</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xl font-bold text-indigo-600">{item.stats.followUpSent}</p>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sent</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xl font-bold text-emerald-600">{conversion}</p>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Conv %</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {status === 'Pending' && item.stats.replied > 0 && (
                                            <Button
                                                variant="primary"
                                                className="bg-indigo-600"
                                                onClick={() => openFollowUpModal(item.id, item.stats.replied)}
                                            >
                                                Send Follow-up
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="p-8 bg-indigo-50 rounded-lg border border-indigo-100">
                <div className="flex gap-6">
                    <i className="fas fa-info-circle text-indigo-600 text-2xl mt-1" />
                    <div>
                        <h4 className="font-bold text-indigo-900 mb-1 leading-none">Why only one follow-up?</h4>
                        <p className="text-indigo-800 text-sm leading-relaxed max-w-2xl">
                            CortexReach focuses on high-intent signals. Recurrent multi-step dripping often leads to domain blacklisting and lower response quality. By focusing on a single, strong follow-up for engaged leads, we maximize your conversion yield.
                        </p>
                    </div>
                </div>
            </div>

            {/* Follow-up Modal */}
            <Modal
                isOpen={isFollowUpModalOpen}
                onClose={closeFollowUpModal}
                title={`Send Follow-up to ${eligibleCount} Replied Leads`}
                size="xl"
            >
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-2">Subject Line</label>
                        <Input
                            placeholder="Checking in: {{firstName}}"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                        <p className="text-xs text-slate-500 mt-2 font-medium">Use {'{{firstName}}'}, {'{{lastName}}'}, {'{{companyName}}'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-2">Email Body</label>
                        <RichTextEditor
                            value={body}
                            onChange={setBody}
                            placeholder="Write your follow-up message..."
                        />
                    </div>
                </div>
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                    <Button variant="outline" onClick={closeFollowUpModal} disabled={isSending}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        className="bg-indigo-600 font-bold"
                        onClick={() => handleSendFollowUp(handleSuccess)}
                        disabled={isSending || !subject || !body}
                    >
                        {isSending ? (
                            <><i className="fas fa-spinner fa-spin mr-2" /> Sending...</>
                        ) : (
                            <><i className="fas fa-paper-plane mr-2" /> Send Follow-up</>
                        )}
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default FollowUps;
