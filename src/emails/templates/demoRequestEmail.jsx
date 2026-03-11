import {
    Html, Head, Body, Container, Section,
    Text, Button, Preview, Hr, Row, Column
} from '@react-email/components';
import { EmailHeader } from '../components/EmailHeader';
import { EmailFooter } from '../components/EmailFooter';

/**
 * DemoRequestEmail
 * campaignType: "demo_request"
 *
 * Purpose: Drive the lead to book a live demo.
 * Uses social proof, low-friction framing, and a
 * calendar-style visual to reduce anxiety around booking.
 */
export const DemoRequestEmail = ({
    // Lead data
    leadFirstName = 'there',
    leadCompany = 'your company',

    // Project data
    projectName = 'Our Platform',
    industry = 'your industry',
    mainBenefit = 'transform your workflow',
    keyFeature1 = 'live product walkthrough',
    keyFeature2 = 'custom setup advice',
    bookingUrl = 'https://yourwebsite.com/book',
    website = 'https://yourwebsite.com',

    // System
    unsubscribeUrl = '#',
}) => (
    <Html lang="en">
        <Head />
        <Preview>15 minutes to see exactly how {projectName} helps {industry} teams</Preview>
        <Body style={styles.body}>
            <Container style={styles.container}>

                <EmailHeader projectName={projectName} />

                {/* Hero */}
                <Section style={styles.heroSection}>
                    <Text style={styles.eyebrow}>PERSONAL INVITE</Text>
                    <Text style={styles.headline}>
                        Hi {leadFirstName} — I'd love to show you {projectName} live.
                    </Text>
                    <Text style={styles.bodyText}>
                        I've been looking at how teams in <strong>{industry}</strong> work, and
                        I think {projectName} could genuinely help <strong>{leadCompany}</strong>{' '}
                        to <strong>{mainBenefit}</strong>. Rather than sending a wall of text,
                        I'd love to just show you — in 15 minutes.
                    </Text>
                </Section>

                {/* What to Expect Card */}
                <Section style={styles.cardSection}>
                    <Text style={styles.cardTitle}>What you'll get in 15 minutes:</Text>

                    <Row style={styles.checkRow}>
                        <Column style={styles.checkCol}>
                            <Text style={styles.checkIcon}>✓</Text>
                        </Column>
                        <Column style={styles.checkTextCol}>
                            <Text style={styles.checkText}>
                                <strong>{keyFeature1}</strong> — tailored to your use case
                            </Text>
                        </Column>
                    </Row>

                    <Row style={styles.checkRow}>
                        <Column style={styles.checkCol}>
                            <Text style={styles.checkIcon}>✓</Text>
                        </Column>
                        <Column style={styles.checkTextCol}>
                            <Text style={styles.checkText}>
                                <strong>{keyFeature2}</strong> — no generic sales deck
                            </Text>
                        </Column>
                    </Row>

                    <Row style={styles.checkRow}>
                        <Column style={styles.checkCol}>
                            <Text style={styles.checkIcon}>✓</Text>
                        </Column>
                        <Column style={styles.checkTextCol}>
                            <Text style={styles.checkText}>
                                Honest answers to your hardest questions
                            </Text>
                        </Column>
                    </Row>
                </Section>

                <Hr style={styles.divider} />

                {/* Booking CTA */}
                <Section style={styles.ctaSection}>
                    <Text style={styles.calendarLabel}>📅 PICK A TIME THAT WORKS</Text>
                    <Text style={styles.ctaHeadline}>
                        Book a 15-minute demo — completely free
                    </Text>
                    <Button href={bookingUrl} style={styles.ctaButton}>
                        Book My Demo Slot →
                    </Button>
                    <Text style={styles.ctaSubtext}>
                        No obligation. Cancel anytime. Takes 30 seconds to book.
                    </Text>
                </Section>

                <Hr style={styles.divider} />

                {/* Soft close */}
                <Section style={styles.signOffSection}>
                    <Text style={styles.signOffText}>
                        Or if you'd prefer, just hit reply and let me know a time that works
                        for you and I'll send a calendar invite directly.
                    </Text>
                    <Text style={styles.signOff}>
                        Looking forward to it,<br />
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
        backgroundColor: '#f0f9ff',
        margin: 0,
        padding: '32px 0',
    },
    container: {
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(14,165,233,0.10)',
    },
    heroSection: {
        padding: '40px 48px 32px',
    },
    eyebrow: {
        fontSize: '10px',
        fontWeight: 'bold',
        letterSpacing: '2.5px',
        color: '#0284c7',
        margin: '0 0 12px',
        fontFamily: "'Helvetica Neue', sans-serif",
    },
    headline: {
        fontSize: '26px',
        fontWeight: 'bold',
        color: '#0f172a',
        lineHeight: '1.3',
        margin: '0 0 16px',
    },
    bodyText: {
        fontSize: '15px',
        color: '#475569',
        lineHeight: '1.75',
        margin: 0,
        fontFamily: "'Helvetica Neue', sans-serif",
    },
    cardSection: {
        margin: '0 48px',
        padding: '24px 28px',
        backgroundColor: '#f0f9ff',
        borderRadius: '10px',
        border: '1px solid #bae6fd',
    },
    cardTitle: {
        fontSize: '13px',
        fontWeight: 'bold',
        color: '#0369a1',
        margin: '0 0 16px',
        fontFamily: "'Helvetica Neue', sans-serif",
        letterSpacing: '0.5px',
    },
    checkRow: {
        marginBottom: '10px',
    },
    checkCol: {
        width: '28px',
        verticalAlign: 'top',
    },
    checkIcon: {
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#0ea5e9',
        margin: 0,
        fontFamily: "'Helvetica Neue', sans-serif",
    },
    checkTextCol: {
        verticalAlign: 'top',
    },
    checkText: {
        fontSize: '14px',
        color: '#334155',
        margin: 0,
        lineHeight: '1.5',
        fontFamily: "'Helvetica Neue', sans-serif",
    },
    divider: {
        borderColor: '#e2e8f0',
        margin: '28px 48px',
    },
    ctaSection: {
        padding: '0 48px 8px',
        textAlign: 'center',
    },
    calendarLabel: {
        fontSize: '11px',
        fontWeight: 'bold',
        letterSpacing: '2px',
        color: '#94a3b8',
        margin: '0 0 8px',
        fontFamily: "'Helvetica Neue', sans-serif",
    },
    ctaHeadline: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#0f172a',
        margin: '0 0 20px',
        fontFamily: "'Helvetica Neue', sans-serif",
    },
    ctaButton: {
        backgroundColor: '#0284c7',
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
    signOffText: {
        fontSize: '14px',
        color: '#64748b',
        lineHeight: '1.7',
        margin: '0 0 20px',
        fontFamily: "'Helvetica Neue', sans-serif",
    },
    signOff: {
        fontSize: '14px',
        color: '#334155',
        lineHeight: '1.7',
        margin: 0,
        fontFamily: "'Helvetica Neue', sans-serif",
    },
};

export default DemoRequestEmail;
