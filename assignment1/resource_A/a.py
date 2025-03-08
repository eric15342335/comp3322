def process_data():
    summary_data = {}
    with open("summary.txt", "r", encoding="utf-8") as f_summary:
        for line in f_summary:
            parts = line.strip().split()
            year = parts[0]
            summary_text = " ".join(parts[1:])
            summary_data[year] = summary_text

    projects_by_year = {}
    with open("research_projects.txt", "r", encoding="utf-8") as f_projects:
        current_year = None
        projects = []
        for line in f_projects:
            line = line.strip()
            if line.isdigit() and len(line) == 4: # Year line
                if current_year:
                    projects_by_year[current_year] = projects
                current_year = line
                projects = []
            elif line and line != "Research Projects (since Sept 2012)": # Project line
                projects.append(line)
        if current_year:
            projects_by_year[current_year] = projects

    year_groups_html = ""
    years_sorted = sorted(projects_by_year.keys(), reverse=True)

    for year in years_sorted:
        summary_line = summary_data[year]
        projects = projects_by_year[year]

        year_group_html = f"""
            <div class="year-group">
                <summary class="year-summary">
                    <img src="close.png" class="collapse-icon" alt="Collapse">
                    <img src="open.png" class="expand-icon" alt="Expand">
                    {summary_line}
                </summary>
                <div class="project-list">
        """
        for project in projects:
            year_group_html += f"<p class='project-item'>{project}</p>"
        year_group_html += """
                </div>
            </div>
        """
        year_groups_html += year_group_html

    # Set the first year group to be initially open
    year_groups_html = year_groups_html.replace('<div class="year-group">', '<details class="year-group">', 1)
    year_groups_html = year_groups_html.replace('</summary>', '</summary></details>', 1)
    year_groups_html = year_groups_html.replace('<div class="year-group">', '<details class="year-group">') # replace remaining
    year_groups_html = year_groups_html.replace('</summary>', '</summary></details>') # replace remaining

    # Set first group to open by default
    year_groups_html = year_groups_html.replace('<details class="year-group">', '<details class="year-group" open>', 1)


    with open("index_taskA.html", "r", encoding="utf-8") as f_html_template:
        html_content = f_html_template.read()
        html_content = html_content.replace("<!-- Year groups will be inserted here -->", year_groups_html)

    with open("index_taskA.html", "w", encoding="utf-8") as f_html_output:
        f_html_output.write(html_content)


process_data()