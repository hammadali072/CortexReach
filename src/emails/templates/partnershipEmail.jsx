import {
    Html, Head, Body, Container, Section,
    Text, Button, Preview, Hr, Row, Column
} from '@react-email/components';
import { EmailHeader } from '../components/EmailHeader';
import { EmailFooter } from '../components/EmailFooter';

/**
 * PartnershipEmail
 * campaignType: "partnership"
 *
 * Purpose: Propose a mutual business relationship — co-marketing,
 * referrals, integrations, or reseller arrangements.
 * Tone: Peer-to-peer, strategic, collaborative — not salesy.
 */
export const PartnershipEmail = ({
    // Lead data
    leadFirstName = 'there',
    leadCompany = 'your company',

    // Project data
    projectName = 'Our Company',
    industry = 'your industry',
    mainBenefit = 'grow together',
    keyFeature1 = 'shared customer base',
    keyFeature2 = 'co-marketing opportunities',
    website = 'https://yourwebsite.com',

    // System
    unsubscribeUrl = '#',
}) => (
    <Html lang="en">
        <Head />
        <Preview>A partnership idea between {projectName} and {leadCompany}</Preview>
        <Body style={styles.body}>
            <Container style={styles.container}>

                <EmailHeader projectName={projectName} />

                {/* Intro */}
                <Section style={styles.introSection}>
                    <Text style={styles.eyebrow}>PARTNERSHIP PROPOSAL</Text>
                    <Text style={styles.headline}>
                        Hi {leadFirstName}, I think {projectName} and {leadCompany} could
                        build something great together.
                    </Text>
                    <Text style={styles.bodyText}>
                        I've been following what {leadCompany} is doing in the {industry} space —
                        it's genuinely impressive. I reached out because I see a real opportunity
                        for both of our teams to <strong>{mainBenefit}</strong>.
                    </Text>
                </Section>

                <Hr style={styles.divider} />

                {/* The Idea */}
                <Section style={styles.ideaSection}>
                    <Text style={styles.sectionLabel}>THE OPPORTUNITY</Text>
                    <Text style={styles.bodyText}>
                        Our audiences and goals are naturally aligned. Here's what I had in mind:
                    </Text>

                    {/* Opportunity Block 1 */}
                    <Row style={styles.opportunityRow}>
                        <Column style={styles.opportunityIconCol}>
                            <Text style={styles.bulletIcon}>→</Text>
                        </Column>
                        <Column>
                            <Text style={styles.opportunityTitle}>{keyFeature1}</Text>
                            <Text style={styles.opportunityDesc}>
                                We serve similar customers — a referral or co-marketing arrangement
                                could benefit both our pipelines without extra cost.
                            </Text>
                        </Column>
                    </Row>

                    <Row style={styles.opportunityRow}>
                        <Column style={styles.opportunityIconCol}>
                            <Text style={styles.bulletIcon}>→</Text>
                        </Column>
                        <Column>
                            <Text style={styles.opportunityTitle}>{keyFeature2}</Text>
                            <Text style={styles.opportunityDesc}>
                                Joint content, webinars, or case studies that position both brands
                                as go-to resources in {industry}.
                            </Text>
                        </Column>
                    </Row>
                </Section>

                {/* What's In It For Them */}
                <Section style={styles.valueCard}>
                    <Text style={styles.valueCardTitle}>
                        What {leadCompany} gets out of this:
                    </Text>
                    <Text style={styles.valueCardBody}>
                        Access to our audience, shared content resources, and a stronger combined
                        presence in the {industry} market — with minimal effort on your end.
                        We handle the heavy lifting.
                    </Text>
                </Section>

                <Hr style={styles.divider} />

                {/* CTA */}
                <Section style={styles.ctaSection}>
                    <Text style={styles.ctaText}>
                        I'd love to get on a 20-minute call to explore whether this is
                        a good fit — no commitment, just a conversation between peers.
                    </Text>
                    <Button href={website} style={styles.ctaButton}>
                        Let's Explore This Together →
                    </Button>
                    <Text style={styles.ctaSubtext}>
                        Or just reply to this email — I read every response personally.
                    </Text>
                </Section>

                <Section style={styles.signOffSection}>
                    <Text style={styles.signOff}>
                        Warm regards,<br />
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
        backgroundColor: '#fdf4ff',
        margin: 0,
        padding: '32px 0',
    },
    container: {
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(147,51,234,0.08)',
    },
    introSection: {
        padding: '40px 48px 32px',
    },
    eyebrow: {
        fontSize: '10px',
        fontWeight: 'bold',
        letterSpacing: '2.5px',
        color: '#9333ea',
        margin: '0 0 12px',
        fontFamily: "'Helvetica Neue', sans-serif",
    },
    headline: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#0f172a',
        lineHeight: '1.35',
        margin: '0 0 16px',
    },
    bodyText: {
        fontSize: '15px',
        color: '#475569',
        lineHeight: '1.75',
        margin: '0 0 16px',
        fontFamily: "'Helvetica Neue', sans-serif",
    },
    divider: {
        borderColor: '#f3e8ff',
        margin: '0 48px',
    },
    ideaSection: {
        padding: '32px 48px',
    },
    sectionLabel: {
        fontSize: '10px',
        fontWeight: 'bold',
        letterSpacing: '2.5px',
        color: '#94a3b8',
        margin: '0 0 16px',
        fontFamily: "'Helvetica Neue', sans-serif",
    },
    opportunityRow: {
        marginBottom: '20px',
    },
    opportunityIconCol: {
        width: '28px',
        verticalAlign: 'top',
        paddingTop: '2px',
    },
    bulletIcon: {
        fontSize: '16px',
        color: '#9333ea',
        fontWeight: 'bold',
        margin: 0,
        fontFamily: "'Helvetica Neue', sans-serif",
    },
    opportunityTitle: {
        fontSize: '15px',
        fontWeight: 'bold',
        color: '#1e293b',
        margin: '0 0 4px',
        fontFamily: "'Helvetica Neue', sans-serif",
    },
    opportunityDesc: {
        fontSize: '14px',
        color: '#64748b',
        margin: 0,
        lineHeight: '1.6',
        fontFamily: "'Helvetica Neue', sans-serif",
    },
    valueCard: {
        margin: '0 48px 32px',
        padding: '20px 24px',
        backgroundColor: '#fdf4ff',
        border: '1px solid #e9d5ff',
        borderRadius: '10px',
    },
    valueCardTitle: {
        fontSize: '13px',
        fontWeight: 'bold',
        color: '#7e22ce',
        margin: '0 0 8px',
        fontFamily: "'Helvetica Neue', sans-serif",
    },
    valueCardBody: {
        fontSize: '14px',
        color: '#475569',
        lineHeight: '1.7',
        margin: 0,
        fontFamily: "'Helvetica Neue', sans-serif",
    },
    ctaSection: {
        padding: '28px 48px',
        textAlign: 'center',
    },
    ctaText: {
        fontSize: '15px',
        color: '#334155',
        lineHeight: '1.7',
        margin: '0 0 20px',
        fontFamily: "'Helvetica Neue', sans-serif",
    },
    ctaButton: {
        backgroundColor: '#9333ea',
        color: '#ffffff',
        padding: '14px 36px',
        borderRadius: '8px',
        fontWeight: 'bold',
        fontSize: '15px',
        display: 'inline-block',
        textDecoration: 'none',
        fontFamily: "'Helvetica Neue', sans-serif",
    },
    ctaSubtext: {
        fontSize: '12px',
        color: '#94a3b8',
        margin: '14px 0 0',
        fontFamily: "'Helvetica Neue', sans-serif",
    },
    signOffSection: {
        padding: '0 48px 40px',
    },
    signOff: {
        fontSize: '14px',
        color: '#64748b',
        lineHeight: '1.7',
        margin: 0,
        fontFamily: "'Helvetica Neue', sans-serif",
    },
};

export default PartnershipEmail;
