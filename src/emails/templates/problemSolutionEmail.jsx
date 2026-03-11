import {
    Html, Head, Body, Container, Section,
    Text, Button, Preview, Hr
} from '@react-email/components';
import { EmailHeader } from '../components/EmailHeader';
import { EmailFooter } from '../components/EmailFooter';

/**
 * ProblemSolutionEmail
 * campaignType: "problem_solution"
 *
 * Purpose: Open a loop with a relatable pain point,
 * then close it with your product as the clear solution.
 * Highest-converting narrative structure for cold outreach.
 */
export const ProblemSolutionEmail = ({
    // Lead data
    leadFirstName = 'there',
    leadCompany = 'your company',

    // Project data
    projectName = 'Our Platform',
    industry = 'your industry',
    mainBenefit = 'eliminate manual work',
    keyFeature1 = 'smart automation',
    keyFeature2 = 'unified dashboard',
    website = 'https://yourwebsite.com',

    // System
    unsubscribeUrl = '#',
}) => (
    <Html lang="en">
        <Head />
        <Preview>Most {industry} teams struggle with this — here's how to fix it</Preview>
        <Body style={styles.body}>
            <Container style={styles.container}>

                <EmailHeader projectName={projectName} />

                {/* Problem Block */}
                <Section style={styles.problemSection}>
                    <Text style={styles.problemLabel}>THE PROBLEM</Text>
                    <Text style={styles.problemHeadline}>
                        Most {industry} teams are wasting hours on work that shouldn't exist.
                    </Text>
                    <Text style={styles.bodyText}>
                        Hi {leadFirstName}, I've spoken to dozens of people at companies like{' '}
                        <strong>{leadCompany}</strong>. The same issue keeps coming up — teams
                        spend enormous energy on repetitive tasks, scattered tools, and
                        broken handoffs. Not because they're doing something wrong, but because
                        the systems around them aren't built for how they actually work.
                    </Text>
                </Section>

                {/* Visual Divider */}
                <Section style={styles.arrowSection}>
                    <Text style={styles.arrowText}>↓</Text>
                </Section>

                {/* Solution Block */}
                <Section style={styles.solutionSection}>
                    <Text style={styles.solutionLabel}>THE SOLUTION</Text>
                    <Text style={styles.solutionHeadline}>
                        {projectName} helps {industry} teams {mainBenefit}.
                    </Text>
                    <Text style={styles.bodyText}>
                        We built {projectName} specifically for teams like yours. Instead of
                        stitching together five tools, you get one system with{' '}
                        <strong>{keyFeature1}</strong> and <strong>{keyFeature2}</strong>{' '}
                        — so your team can focus on the work that actually drives results.
                    </Text>
                </Section>

                <Hr style={styles.divider} />

                {/* Social Proof Callout */}
                <Section style={styles.proofSection}>
                    <Text style={styles.quoteText}>
                        "We cut our weekly reporting time by 70% in the first month."
                    </Text>
                    <Text style={styles.quoteAttrib}>— A customer in {industry}</Text>
                </Section>

                <Hr style={styles.divider} />

                {/* CTA */}
                <Section style={styles.ctaSection}>
                    <Text style={styles.ctaIntro}>
                        Want to see how {projectName} would work for <strong>{leadCompany}</strong>?
                    </Text>
                    <Button href={website} style={styles.ctaButton}>
                        Get a Free Walkthrough →
                    </Button>
                    <Text style={styles.ctaSubtext}>15-minute call. No pitch. Just answers.</Text>
                </Section>

                <EmailFooter unsubscribeUrl={unsubscribeUrl} />
            </Container>
        </Body>
    </Html>
);

const styles = {
    body: {
        fontFamily: "'Georgia', serif",
        backgroundColor: '#fafafa',
        margin: 0,
        padding: '32px 0',
    },
    container: {
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    },
    problemSection: {
        padding: '40px 48px 28px',
        backgroundColor: '#fff7ed',
        borderLeft: '4px solid #f97316',
    },
    problemLabel: {
        fontSize: '10px',
        fontWeight: 'bold',
        letterSpacing: '2.5px',
        color: '#ea580c',
        margin: '0 0 10px',
        fontFamily: "'Helvetica Neue', sans-serif",
    },
    problemHeadline: {
        fontSize: '22px',
        fontWeight: 'bold',
        color: '#1c1917',
        lineHeight: '1.35',
        margin: '0 0 16px',
    },
    arrowSection: {
        padding: '8px 48px',
        backgroundColor: '#f8fafc',
        textAlign: 'center',
    },
    arrowText: {
        fontSize: '28px',
        color: '#4f46e5',
        margin: 0,
        fontFamily: "'Helvetica Neue', sans-serif",
    },
    solutionSection: {
        padding: '28px 48px 36px',
        backgroundColor: '#f0fdf4',
        borderLeft: '4px solid #22c55e',
    },
    solutionLabel: {
        fontSize: '10px',
        fontWeight: 'bold',
        letterSpacing: '2.5px',
        color: '#16a34a',
        margin: '0 0 10px',
        fontFamily: "'Helvetica Neue', sans-serif",
    },
    solutionHeadline: {
        fontSize: '22px',
        fontWeight: 'bold',
        color: '#14532d',
        lineHeight: '1.35',
        margin: '0 0 16px',
    },
    bodyText: {
        fontSize: '15px',
        color: '#475569',
        lineHeight: '1.75',
        margin: 0,
        fontFamily: "'Helvetica Neue', sans-serif",
    },
    divider: {
        borderColor: '#f1f5f9',
        margin: '0 48px',
    },
    proofSection: {
        padding: '28px 48px',
        backgroundColor: '#f8fafc',
    },
    quoteText: {
        fontSize: '17px',
        fontStyle: 'italic',
        color: '#334155',
        margin: '0 0 8px',
        lineHeight: '1.6',
    },
    quoteAttrib: {
        fontSize: '13px',
        color: '#94a3b8',
        margin: 0,
        fontFamily: "'Helvetica Neue', sans-serif",
    },
    ctaSection: {
        padding: '32px 48px 40px',
        textAlign: 'center',
    },
    ctaIntro: {
        fontSize: '16px',
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

export default ProblemSolutionEmail;
