import os

from dotenv import load_dotenv
from openai import OpenAI


load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=api_key) if api_key else None


def generate_fallback_recommendation(risk):
    """
    Generate a local rule-based mitigation recommendation.

    This does not call an external AI service and allows RiskLens
    to remain usable when the OpenAI API is unavailable.
    """

    threat = (risk.threat or "").lower()
    vulnerability = (risk.vulnerability or "").lower()
    title = (risk.title or "").lower()

    combined_text = f"{title} {threat} {vulnerability}"

    recommendations = []

    # Authentication / account compromise
    if any(
        keyword in combined_text
        for keyword in [
            "account",
            "credential",
            "password",
            "authentication",
            "phishing",
            "unauthorized access",
        ]
    ):
        recommendations.extend(
            [
                "Enable multi-factor authentication for privileged and sensitive accounts.",
                "Apply strong password and account lockout policies.",
                "Review user permissions and remove unnecessary privileged access.",
                "Monitor authentication logs for suspicious login activity.",
            ]
        )

    # Backup / data loss
    if any(
        keyword in combined_text
        for keyword in [
            "backup",
            "data loss",
            "ransomware",
            "recovery",
        ]
    ):
        recommendations.extend(
            [
                "Implement scheduled backups for critical business data.",
                "Maintain at least one protected or offline backup copy.",
                "Test restoration procedures regularly.",
                "Document recovery responsibilities and recovery procedures.",
            ]
        )

    # Vulnerability / patch management
    if any(
        keyword in combined_text
        for keyword in [
            "patch",
            "outdated",
            "vulnerability",
            "unpatched",
            "software",
        ]
    ):
        recommendations.extend(
            [
                "Establish a documented vulnerability and patch management process.",
                "Prioritize remediation based on asset criticality and vulnerability severity.",
                "Regularly scan systems for known vulnerabilities.",
                "Track remediation activities until identified vulnerabilities are resolved.",
            ]
        )

    # Internet-facing systems
    if any(
        keyword in combined_text
        for keyword in [
            "internet",
            "public",
            "web server",
            "exposed",
            "external",
        ]
    ):
        recommendations.extend(
            [
                "Minimize externally exposed services and ports.",
                "Apply network segmentation to internet-facing systems.",
                "Monitor external systems for suspicious activity.",
                "Use secure configuration baselines for publicly accessible services.",
            ]
        )

    # Malware
    if any(
        keyword in combined_text
        for keyword in [
            "malware",
            "virus",
            "trojan",
            "ransomware",
        ]
    ):
        recommendations.extend(
            [
                "Deploy endpoint protection on supported systems.",
                "Restrict unnecessary administrative privileges.",
                "Keep operating systems and applications updated.",
                "Establish an incident response procedure for malware infections.",
            ]
        )

    # Generic fallback
    if not recommendations:
        recommendations = [
            "Review the affected asset and validate the identified vulnerability.",
            "Apply appropriate technical or administrative controls to reduce exposure.",
            "Assign an owner responsible for implementing the mitigation plan.",
            "Define a target remediation date based on the risk severity.",
            "Review the risk after mitigation to determine the remaining residual risk.",
        ]

    # Critical / high risks get additional recommendations
    if risk.severity in ["Critical", "High"]:
        recommendations.append(
            "Prioritize this risk for remediation because of its current severity."
        )

    # Remove duplicates
    recommendations = list(dict.fromkeys(recommendations))

    return "\n".join(
        f"{index}. {recommendation}"
        for index, recommendation in enumerate(
            recommendations,
            start=1,
        )
    )


def generate_mitigation_recommendation(risk):
    """
    Attempt an OpenAI-generated recommendation first.

    If OpenAI is unavailable, automatically return a local
    rule-based recommendation.
    """

    if client is None:
        return {
            "recommendation": generate_fallback_recommendation(risk),
            "source": "local_fallback",
        }

    try:
        prompt = f"""
You are assisting with a cybersecurity Governance, Risk, and Compliance
(GRC) risk assessment.

Provide practical mitigation recommendations for the following risk.

Risk title: {risk.title}
Threat: {risk.threat}
Vulnerability: {risk.vulnerability}
Likelihood: {risk.likelihood}/5
Impact: {risk.impact}/5
Risk score: {risk.risk_score}
Severity: {risk.severity}

Provide concise, practical mitigation actions suitable for a small or
medium-sized organization.

Do not claim that the organization is compliant with any cybersecurity
framework.
"""

        response = client.responses.create(
            model="gpt-5-mini",
            input=prompt,
        )

        return {
            "recommendation": response.output_text,
            "source": "openai",
        }

    except Exception as error:
        print(f"OpenAI recommendation unavailable: {error}")
        print("Using local RiskLens recommendation engine.")

        return {
            "recommendation": generate_fallback_recommendation(risk),
            "source": "local_fallback",
        }