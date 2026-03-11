import {
    Html, Head, Body, Container, Section,
    Text, Button, Preview, Hr, Row, Column
} from '@react-email/components';
import { EmailHeader } from '../components/EmailHeader';
import { EmailFooter } from '../components/EmailFooter';

/**
 * ProductPitchEmail
 * campaignType: "product_pitch"
 *
 * Purpose: Highlight the product's value proposition with a clear
 * benefit breakdown and a strong single CTA.
 */
export const ProductPitchEmail = ({
    // Lead data
    leadFirstName = 'there',
    leadCompany = 'your company',

    // Project data
    projectName = 'Our Product',
    industry = 'your industry',
    mainBenefit = 'save time and grow faster',
    keyFeature1 = 'Automated workflows',
    keyFeature2 = 'Real-time analytics',
    keyFeature3 = 'Seamless integrations',
    website = 'https://yourwebsite.com',

    // System
    unsubscribeUrl = '#',
}) => (
    <Html lang="en">
        <Head />
        <Preview>{projectName} — built for {industry} teams who want to {mainBenefit}</Preview>
        <Body style={styles.body}>
            <Container style={styles.container}>

                <EmailHeader projectName={projectName} />

                {/* Headline Section */}
                <Section style={styles.heroSection}>
                    <Text style={styles.eyebrow}>BUILT FOR {industry.toUpperCase()}</Text>
                    <Text style={styles.headline}>
                        Hi {leadFirstName}, here's what {projectName} can do for {leadCompany}
                    </Text>
                    <Text style={styles.subtext}>
                        We've helped companies just like yours <strong>{mainBenefit}</strong>.
                        Here's a quick look at what makes us different.
                    </Text>
                </Section>

                <Hr style={styles.divider} />

                {/* 3 Feature Blocks */}
                <Section style={styles.featuresSection}>
                    <Text style={styles.sectionLabel}>WHAT YOU GET</Text>

                    <Row style={styles.featureRow}>
                        <Column style={styles.featureIconCol}>
                            <Text style={styles.featureIcon}>⚡</Text>
                        </Column>
                        <Column style={styles.featureTextCol}>
                            <Text style={styles.featureTitle}>{keyFeature1}</Text>
                            <Text style={styles.featureDesc}>
                                Stop doing things manually. Let the system work while you focus on what matters.
                            </Text>
                        </Column>
                    </Row>

                    <Row style={styles.featureRow}>
                        <Column style={styles.featureIconCol}>
                            <Text style={styles.featureIcon}>📊</Text>
                        </Column>
                        <Column style={styles.featureTextCol}>
                            <Text style={styles.featureTitle}>{keyFeature2}</Text>
                            <Text style={styles.featureDesc}>
                                See exactly what's working, in real time. No guesswork, no lag.
                            </Text>
                        </Column>
                    </Row>

                    <Row style={styles.featureRow}>
                        <Column style={styles.featureIconCol}>
                            <Text style={styles.featureIcon}>🔗</Text>
                        </Column>
                        <Column style={styles.featureTextCol}>
                            <Text style={styles.featureTitle}>{keyFeature3}</Text>
                            <Text style={styles.featureDesc}>
                                Plugs into your existing stack — zero disruption, instant value.
                            </Text>
                        </Column>
                    </Row>
                </Section>

                <Hr style={styles.divider} />

                {/* CTA Section */}
                <Section style={styles.ctaSection}>
                    <Text style={styles.ctaText}>
                        Ready to see it in action for <strong>{leadCompany}</strong>?
                    </Text>
                    <Button href={website} style={styles.ctaButton}>
                        See {projectName} Live →
                    </Button>
                    <Text style={styles.ctaSubtext}>
                        Takes 2 minutes. No credit card required.
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
        backgroundColor: '#f0f4ff',
        margin: 0,
        padding: '32px 0',
    },
    container: {
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(79,70,229,0.08)',
    },
    heroSection: {
        padding: '40px 48px 32px',
    },
    eyebrow: {
        fontSize: '11px',
        fontWeight: 'bold',
        letterSpacing: '2px',
        color: '#6366f1',
        margin: '0 0 12px',
        fontFamily: "'Helvetica Neue', sans-serif",
    },
    headline: {
        fontSize: '26px',
        fontWeight: 'bold',
        color: '#0f172a',
        margin: '0 0 16px',
        lineHeight: '1.3',
    },
    subtext: {
        fontSize: '16px',
        color: '#475569',
        lineHeight: '1.7',
        margin: 0,
        fontFamily: "'Helvetica Neue', sans-serif",
    },
    divider: {
        borderColor: '#e2e8f0',
        margin: '0 48px',
    },
    featuresSection: {
        padding: '32px 48px',
    },
    sectionLabel: {
        fontSize: '10px',
        fontWeight: 'bold',
        letterSpacing: '2px',
        color: '#94a3b8',
        margin: '0 0 24px',
        fontFamily: "'Helvetica Neue', sans-serif",
    },
    featureRow: {
        marginBottom: '20px',
    },
    featureIconCol: {
        width: '44px',
        verticalAlign: 'top',
    },
    featureIcon: {
        fontSize: '22px',
        margin: '0',
        lineHeight: '1',
    },
    featureTextCol: {
        verticalAlign: 'top',
        paddingLeft: '8px',
    },
    featureTitle: {
        fontSize: '15px',
        fontWeight: 'bold',
        color: '#1e293b',
        margin: '0 0 4px',
        fontFamily: "'Helvetica Neue', sans-serif",
    },
    featureDesc: {
        fontSize: '14px',
        color: '#64748b',
        margin: 0,
        lineHeight: '1.6',
        fontFamily: "'Helvetica Neue', sans-serif",
    },
    ctaSection: {
        padding: '32px 48px 40px',
        textAlign: 'center',
        backgroundColor: '#fafbff',
    },
    ctaText: {
        fontSize: '17px',
        color: '#1e293b',
        margin: '0 0 20px',
        fontFamily: "'Helvetica Neue', sans-serif",
    },
    ctaButton: {
        backgroundColor: '#4f46e5',
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
};

export default ProductPitchEmail;
