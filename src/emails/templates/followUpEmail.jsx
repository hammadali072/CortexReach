import {
    Html, Head, Body, Container, Section,
    Text, Button, Preview, Hr
} from '@react-email/components';
import { EmailHeader } from '../components/EmailHeader';
import { EmailFooter } from '../components/EmailFooter';

/**
 * FollowUpEmail
 * campaignType: "follow_up"
 *
 * Product Rule (from Sequences.jsx):
 * Follow-ups are ONLY sent to engaged (opened) leads.
 * Limit to a single follow-up step to reduce spam and focus on yield.
 *
 * Purpose: Short, human, low-pressure nudge. Reference that they
 * opened the first email (they showed interest). The goal is a reply,
 * not a sale. Keep it under 100 words.
 */
export const FollowUpEmail = ({
    // Lead data
    leadFirstName = 'there',
    leadCompany = 'your company',

    // Project data
    projectName = 'Our Platform',
    industry = 'your industry',
    mainBenefit = 'help your team move faster',
    website = 'https://yourwebsite.com',

    // Campaign context — the subject of the first email
    previousSubject = 'our last note',

    // System
    unsubscribeUrl = '#',
}) => (
    <Html lang="en">
        <Head />
        <Preview>Quick follow-up — wanted to make sure this didn't get buried</Preview>
        <Body style={styles.body}>
            <Container style={styles.container}>

                <EmailHeader projectName={projectName} />

                {/* Main body — intentionally short and human */}
                <Section style={styles.mainSection}>

                    <Text style={styles.greeting}>Hi {leadFirstName},</Text>

                    <Text style={styles.bodyText}>
                        I noticed you had a chance to look at {previousSubject} — wanted to
                        quickly follow up in case it got buried.
                    </Text>

                    <Text style={styles.bodyText}>
                        I know inboxes are chaotic, so I'll keep this short: if there's any
                        part of what we do that felt relevant to <strong>{leadCompany}</strong>,
                        I'd genuinely love to have a quick conversation.
                    </Text>

                    <Text style={styles.bodyText}>
                        We help {industry} teams <strong>{mainBenefit}</strong> — and I think
                        we could do the same for you.
                    </Text>

                    {/* Soft question to drive a reply */}
                    <Section style={styles.questionCard}>
                        <Text style={styles.questionText}>
                            Is this something worth 10 minutes of your time this week?
                        </Text>
                    </Section>

                    <Text style={styles.bodyText}>
                        You can just hit reply with a "yes" or "not now" — either answer
                        is totally fine.
                    </Text>

                    <Hr style={styles.divider} />

                    {/* Optional CTA for those who prefer a link */}
                    <Button href={website} style={styles.ctaButton}>
                        Take Another Look →
                    </Button>

                    <Text style={styles.signOff}>
                        Thanks for your time,<br />
                        The {projectName} Team
                    </Text>

                </Section>

                <EmailFooter unsubscribeUrl={unsubscribeUrl} />
            </Container>
        </Body>
    </Html>
);

const styles = {
    body: {
        fontFamily: "'Georgia', serif",
        backgroundColor: '#f8fafc',
        margin: 0,
        padding: '32px 0',
    },
    container: {
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
    },
    mainSection: {
        padding: '40px 48px',
    },
    greeting: {
        fontSize: '17px',
        color: '#0f172a',
        fontWeight: 'bold',
        margin: '0 0 20px',
        fontFamily: "'Helvetica Neue', sans-serif",
    },
    bodyText: {
        fontSize: '15px',
        color: '#475569',
        lineHeight: '1.8',
        margin: '0 0 18px',
        fontFamily: "'Helvetica Neue', sans-serif",
    },
    questionCard: {
        backgroundColor: '#fafbff',
        border: '1px solid #e0e7ff',
        borderLeft: '3px solid #6366f1',
        borderRadius: '6px',
        padding: '16px 20px',
        margin: '4px 0 20px',
    },
    questionText: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#3730a3',
        margin: 0,
        lineHeight: '1.5',
        fontFamily: "'Helvetica Neue', sans-serif",
    },
    divider: {
        borderColor: '#f1f5f9',
        margin: '28px 0',
    },
    ctaButton: {
        backgroundColor: '#4f46e5',
        color: '#ffffff',
        padding: '12px 28px',
        borderRadius: '8px',
        fontWeight: 'bold',
        fontSize: '14px',
        display: 'inline-block',
        textDecoration: 'none',
        marginBottom: '28px',
        fontFamily: "'Helvetica Neue', sans-serif",
    },
    signOff: {
        fontSize: '14px',
        color: '#64748b',
        lineHeight: '1.7',
        margin: 0,
        fontFamily: "'Helvetica Neue', sans-serif",
    },
};

export default FollowUpEmail;
