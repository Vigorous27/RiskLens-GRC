from io import BytesIO
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import (
    ParagraphStyle,
    getSampleStyleSheet,
)
from reportlab.lib.units import mm
from reportlab.platypus import (
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


def build_risk_report(
    user,
    assets,
    risks,
    controls,
    coverage_percentage,
):
    buffer = BytesIO()

    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
        title="RiskLens GRC Cybersecurity Risk Assessment",
        author="RiskLens GRC",
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "RiskLensTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=24,
        leading=30,
        textColor=colors.HexColor("#0F172A"),
        alignment=TA_LEFT,
        spaceAfter=10,
    )

    subtitle_style = ParagraphStyle(
        "Subtitle",
        parent=styles["Normal"],
        fontSize=11,
        leading=17,
        textColor=colors.HexColor("#64748B"),
        spaceAfter=20,
    )

    section_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=15,
        leading=19,
        textColor=colors.HexColor("#0F172A"),
        spaceBefore=12,
        spaceAfter=10,
    )

    body_style = ParagraphStyle(
        "Body",
        parent=styles["BodyText"],
        fontSize=9.5,
        leading=15,
        textColor=colors.HexColor("#475569"),
        spaceAfter=8,
    )

    small_style = ParagraphStyle(
        "Small",
        parent=styles["BodyText"],
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#64748B"),
    )

    center_small_style = ParagraphStyle(
        "CenterSmall",
        parent=small_style,
        alignment=TA_CENTER,
    )

    story = []

    # -------------------------------------------------
    # TITLE
    # -------------------------------------------------

    story.append(
        Paragraph(
            "RiskLens GRC",
            ParagraphStyle(
                "Brand",
                parent=styles["Normal"],
                fontName="Helvetica-Bold",
                fontSize=10,
                textColor=colors.HexColor("#4F46E5"),
                spaceAfter=5,
            ),
        )
    )

    story.append(
        Paragraph(
            "Cybersecurity Risk Assessment",
            title_style,
        )
    )

    story.append(
        Paragraph(
            "Executive cybersecurity risk assessment generated from the "
            "current RiskLens GRC workspace.",
            subtitle_style,
        )
    )

    report_date = datetime.now().strftime(
        "%B %d, %Y"
    )

    metadata = [
        [
            Paragraph(
                "<b>Prepared for</b>",
                small_style,
            ),
            Paragraph(
                user.name,
                small_style,
            ),
        ],
        [
            Paragraph(
                "<b>Account</b>",
                small_style,
            ),
            Paragraph(
                user.email,
                small_style,
            ),
        ],
        [
            Paragraph(
                "<b>Assessment date</b>",
                small_style,
            ),
            Paragraph(
                report_date,
                small_style,
            ),
        ],
    ]

    metadata_table = Table(
        metadata,
        colWidths=[
            38 * mm,
            110 * mm,
        ],
    )

    metadata_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.HexColor("#F8FAFC"),
                ),
                (
                    "BOX",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.HexColor("#E2E8F0"),
                ),
                (
                    "INNERGRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.HexColor("#E2E8F0"),
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE",
                ),
                (
                    "LEFTPADDING",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
                (
                    "RIGHTPADDING",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    7,
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    7,
                ),
            ]
        )
    )

    story.append(metadata_table)
    story.append(Spacer(1, 10 * mm))

    # -------------------------------------------------
    # SUMMARY METRICS
    # -------------------------------------------------

    total_assets = len(assets)
    total_risks = len(risks)

    critical_risks = sum(
        1
        for risk in risks
        if risk.severity == "Critical"
    )

    implemented_controls = sum(
        1
        for control in controls
        if control.implementation_status
        == "Implemented"
    )

    metric_data = [
        [
            Paragraph(
                "<b>Assets Assessed</b>",
                center_small_style,
            ),
            Paragraph(
                "<b>Risks Identified</b>",
                center_small_style,
            ),
            Paragraph(
                "<b>Critical Risks</b>",
                center_small_style,
            ),
            Paragraph(
                "<b>Control Coverage</b>",
                center_small_style,
            ),
        ],
        [
            Paragraph(
                f"<b>{total_assets}</b>",
                ParagraphStyle(
                    "Metric",
                    parent=center_small_style,
                    fontSize=18,
                    leading=22,
                    textColor=colors.HexColor(
                        "#0F172A"
                    ),
                ),
            ),
            Paragraph(
                f"<b>{total_risks}</b>",
                ParagraphStyle(
                    "Metric2",
                    parent=center_small_style,
                    fontSize=18,
                    leading=22,
                    textColor=colors.HexColor(
                        "#0F172A"
                    ),
                ),
            ),
            Paragraph(
                f"<b>{critical_risks}</b>",
                ParagraphStyle(
                    "Metric3",
                    parent=center_small_style,
                    fontSize=18,
                    leading=22,
                    textColor=colors.HexColor(
                        "#DC2626"
                    ),
                ),
            ),
            Paragraph(
                f"<b>{coverage_percentage:.1f}%</b>",
                ParagraphStyle(
                    "Metric4",
                    parent=center_small_style,
                    fontSize=18,
                    leading=22,
                    textColor=colors.HexColor(
                        "#4F46E5"
                    ),
                ),
            ),
        ],
    ]

    metrics_table = Table(
        metric_data,
        colWidths=[38 * mm] * 4,
    )

    metrics_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, -1),
                    colors.HexColor("#F8FAFC"),
                ),
                (
                    "BOX",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.HexColor("#E2E8F0"),
                ),
                (
                    "INNERGRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.HexColor("#E2E8F0"),
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE",
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
            ]
        )
    )

    story.append(metrics_table)
    story.append(Spacer(1, 8 * mm))

    # -------------------------------------------------
    # EXECUTIVE SUMMARY
    # -------------------------------------------------

    story.append(
        Paragraph(
            "Executive Summary",
            section_style,
        )
    )

    executive_summary = (
        f"The current RiskLens assessment includes "
        f"<b>{total_assets}</b> business asset"
        f"{'' if total_assets == 1 else 's'} and "
        f"<b>{total_risks}</b> identified cybersecurity risk"
        f"{'' if total_risks == 1 else 's'}. "
        f"Of these risks, <b>{critical_risks}</b> "
        f"{'is' if critical_risks == 1 else 'are'} rated Critical. "
        f"Security-control implementation is currently "
        f"<b>{coverage_percentage:.1f}%</b>, with "
        f"<b>{implemented_controls}</b> of "
        f"<b>{len(controls)}</b> controls marked as implemented."
    )

    story.append(
        Paragraph(
            executive_summary,
            body_style,
        )
    )

    # -------------------------------------------------
    # ASSET INVENTORY
    # -------------------------------------------------

    story.append(
        Paragraph(
            "Asset Inventory",
            section_style,
        )
    )

    if assets:
        asset_rows = [
            [
                "Asset",
                "Type",
                "Criticality",
                "Sensitivity",
                "Internet",
            ]
        ]

        for asset in assets:
            asset_rows.append(
                [
                    Paragraph(
                        asset.name,
                        small_style,
                    ),
                    Paragraph(
                        asset.asset_type,
                        small_style,
                    ),
                    Paragraph(
                        asset.criticality,
                        small_style,
                    ),
                    Paragraph(
                        asset.data_sensitivity,
                        small_style,
                    ),
                    Paragraph(
                        "Yes"
                        if asset.internet_facing
                        else "No",
                        small_style,
                    ),
                ]
            )

        asset_table = Table(
            asset_rows,
            repeatRows=1,
            colWidths=[
                45 * mm,
                30 * mm,
                27 * mm,
                30 * mm,
                20 * mm,
            ],
        )

        asset_table.setStyle(
            _standard_table_style()
        )

        story.append(asset_table)

    else:
        story.append(
            Paragraph(
                "No assets were recorded for this assessment.",
                body_style,
            )
        )

    story.append(Spacer(1, 5 * mm))

    # -------------------------------------------------
    # PRIORITY RISKS
    # -------------------------------------------------

    story.append(
        Paragraph(
            "Priority Risks",
            section_style,
        )
    )

    priority_risks = sorted(
        risks,
        key=lambda risk: risk.risk_score,
        reverse=True,
    )[:5]

    if priority_risks:
        risk_rows = [
            [
                "Risk",
                "Threat",
                "Score",
                "Severity",
                "Status",
            ]
        ]

        for risk in priority_risks:
            risk_rows.append(
                [
                    Paragraph(
                        risk.title,
                        small_style,
                    ),
                    Paragraph(
                        risk.threat,
                        small_style,
                    ),
                    str(risk.risk_score),
                    risk.severity,
                    risk.status,
                ]
            )

        risk_table = Table(
            risk_rows,
            repeatRows=1,
            colWidths=[
                55 * mm,
                38 * mm,
                15 * mm,
                24 * mm,
                22 * mm,
            ],
        )

        risk_table.setStyle(
            _standard_table_style()
        )

        story.append(risk_table)

    else:
        story.append(
            Paragraph(
                "No cybersecurity risks were recorded.",
                body_style,
            )
        )

    # -------------------------------------------------
    # DETAILED RISKS
    # -------------------------------------------------

    if risks:
        story.append(PageBreak())

        story.append(
            Paragraph(
                "Detailed Risk Register",
                title_style,
            )
        )

        for index, risk in enumerate(
            sorted(
                risks,
                key=lambda item: item.risk_score,
                reverse=True,
            ),
            start=1,
        ):
            risk_content = []

            risk_content.append(
                Paragraph(
                    f"{index}. {risk.title}",
                    section_style,
                )
            )

            detail_data = [
                [
                    "Threat",
                    Paragraph(
                        risk.threat,
                        small_style,
                    ),
                ],
                [
                    "Vulnerability",
                    Paragraph(
                        risk.vulnerability,
                        small_style,
                    ),
                ],
                [
                    "Likelihood",
                    f"{risk.likelihood} / 5",
                ],
                [
                    "Impact",
                    f"{risk.impact} / 5",
                ],
                [
                    "Risk Score",
                    str(risk.risk_score),
                ],
                [
                    "Severity",
                    risk.severity,
                ],
                [
                    "Status",
                    risk.status,
                ],
                [
                    "Mitigation Plan",
                    Paragraph(
                        risk.mitigation_plan
                        or "No mitigation plan recorded.",
                        small_style,
                    ),
                ],
            ]

            details_table = Table(
                detail_data,
                colWidths=[
                    38 * mm,
                    115 * mm,
                ],
            )

            details_table.setStyle(
                TableStyle(
                    [
                        (
                            "BACKGROUND",
                            (0, 0),
                            (0, -1),
                            colors.HexColor(
                                "#F8FAFC"
                            ),
                        ),
                        (
                            "BOX",
                            (0, 0),
                            (-1, -1),
                            0.5,
                            colors.HexColor(
                                "#E2E8F0"
                            ),
                        ),
                        (
                            "INNERGRID",
                            (0, 0),
                            (-1, -1),
                            0.5,
                            colors.HexColor(
                                "#E2E8F0"
                            ),
                        ),
                        (
                            "FONTNAME",
                            (0, 0),
                            (0, -1),
                            "Helvetica-Bold",
                        ),
                        (
                            "FONTSIZE",
                            (0, 0),
                            (-1, -1),
                            8,
                        ),
                        (
                            "TEXTCOLOR",
                            (0, 0),
                            (-1, -1),
                            colors.HexColor(
                                "#475569"
                            ),
                        ),
                        (
                            "VALIGN",
                            (0, 0),
                            (-1, -1),
                            "TOP",
                        ),
                        (
                            "LEFTPADDING",
                            (0, 0),
                            (-1, -1),
                            7,
                        ),
                        (
                            "RIGHTPADDING",
                            (0, 0),
                            (-1, -1),
                            7,
                        ),
                        (
                            "TOPPADDING",
                            (0, 0),
                            (-1, -1),
                            6,
                        ),
                        (
                            "BOTTOMPADDING",
                            (0, 0),
                            (-1, -1),
                            6,
                        ),
                    ]
                )
            )

            risk_content.append(
                details_table
            )

            risk_content.append(
                Spacer(1, 5 * mm)
            )

            story.append(
                KeepTogether(
                    risk_content
                )
            )

    # -------------------------------------------------
    # SECURITY CONTROLS
    # -------------------------------------------------

    story.append(PageBreak())

    story.append(
        Paragraph(
            "Security Controls & Framework Mapping",
            title_style,
        )
    )

    story.append(
        Paragraph(
            "The following security controls are tracked "
            "within the current RiskLens workspace.",
            subtitle_style,
        )
    )

    if controls:
        control_rows = [
            [
                "Control",
                "Status",
                "NIST",
                "ISO 27001",
                "CIS",
            ]
        ]

        for control in controls:
            control_rows.append(
                [
                    Paragraph(
                        control.name,
                        small_style,
                    ),
                    Paragraph(
                        control.implementation_status,
                        small_style,
                    ),
                    Paragraph(
                        control.nist_csf or "-",
                        small_style,
                    ),
                    Paragraph(
                        control.iso_27001 or "-",
                        small_style,
                    ),
                    Paragraph(
                        control.cis_control or "-",
                        small_style,
                    ),
                ]
            )

        control_table = Table(
            control_rows,
            repeatRows=1,
            colWidths=[
                50 * mm,
                28 * mm,
                22 * mm,
                34 * mm,
                22 * mm,
            ],
        )

        control_table.setStyle(
            _standard_table_style()
        )

        story.append(control_table)

    else:
        story.append(
            Paragraph(
                "No security controls were recorded.",
                body_style,
            )
        )

    story.append(Spacer(1, 8 * mm))

    # -------------------------------------------------
    # RECOMMENDED NEXT STEPS
    # -------------------------------------------------

    story.append(
        Paragraph(
            "Recommended Next Steps",
            section_style,
        )
    )

    recommendations = [
        "Prioritize remediation of Critical and High risks.",
        "Implement security controls mapped to the highest-risk exposures.",
        "Review control implementation progress regularly.",
        "Reassess likelihood and impact after mitigation actions are completed.",
        "Maintain the asset inventory as systems and business processes change.",
    ]

    for recommendation in recommendations:
        story.append(
            Paragraph(
                f"- {recommendation}",
                body_style,
            )
        )

    story.append(Spacer(1, 6 * mm))

    story.append(
        Paragraph(
            "This report is generated by RiskLens GRC and is intended "
            "to support cybersecurity risk-management activities. "
            "It does not represent formal certification against NIST, "
            "ISO/IEC 27001, or CIS frameworks.",
            ParagraphStyle(
                "Disclaimer",
                parent=small_style,
                textColor=colors.HexColor(
                    "#94A3B8"
                ),
                spaceBefore=10,
            ),
        )
    )

    document.build(
        story,
        onFirstPage=_add_page_number,
        onLaterPages=_add_page_number,
    )

    pdf_bytes = buffer.getvalue()

    buffer.close()

    return pdf_bytes


def _standard_table_style():
    return TableStyle(
        [
            (
                "BACKGROUND",
                (0, 0),
                (-1, 0),
                colors.HexColor("#0F172A"),
            ),
            (
                "TEXTCOLOR",
                (0, 0),
                (-1, 0),
                colors.white,
            ),
            (
                "FONTNAME",
                (0, 0),
                (-1, 0),
                "Helvetica-Bold",
            ),
            (
                "FONTSIZE",
                (0, 0),
                (-1, 0),
                8,
            ),
            (
                "BACKGROUND",
                (0, 1),
                (-1, -1),
                colors.white,
            ),
            (
                "TEXTCOLOR",
                (0, 1),
                (-1, -1),
                colors.HexColor("#475569"),
            ),
            (
                "FONTNAME",
                (0, 1),
                (-1, -1),
                "Helvetica",
            ),
            (
                "FONTSIZE",
                (0, 1),
                (-1, -1),
                8,
            ),
            (
                "GRID",
                (0, 0),
                (-1, -1),
                0.5,
                colors.HexColor("#E2E8F0"),
            ),
            (
                "VALIGN",
                (0, 0),
                (-1, -1),
                "TOP",
            ),
            (
                "LEFTPADDING",
                (0, 0),
                (-1, -1),
                6,
            ),
            (
                "RIGHTPADDING",
                (0, 0),
                (-1, -1),
                6,
            ),
            (
                "TOPPADDING",
                (0, 0),
                (-1, -1),
                7,
            ),
            (
                "BOTTOMPADDING",
                (0, 0),
                (-1, -1),
                7,
            ),
        ]
    )


def _add_page_number(
    canvas,
    document,
):
    canvas.saveState()

    page_number = canvas.getPageNumber()

    canvas.setFont(
        "Helvetica",
        8,
    )

    canvas.setFillColor(
        colors.HexColor("#94A3B8")
    )

    canvas.drawString(
        18 * mm,
        10 * mm,
        "RiskLens GRC",
    )

    canvas.drawRightString(
        A4[0] - (18 * mm),
        10 * mm,
        f"Page {page_number}",
    )

    canvas.restoreState()