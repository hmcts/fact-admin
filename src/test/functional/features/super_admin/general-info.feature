@fact-admin-tab-general
Feature: General Info

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    Then I am logged out if I am an admin user
    And I am on the admin portal sign in page

  Scenario: Cant leave the name blank
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    When I select Include closed courts
    When I click edit next to court with "amersham-law-courts"
    Then I am redirected to the Edit Court page for the "Amersham Law Courts"
    When I hover over general nav element
    When I click the general tab
    Then I enter "" in the Name textbox
    And I click the general info save button
    Then The error message displays for general info "A problem occurred when saving the general information."

  Scenario: Editing general info with the court name already exist
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    When I select Include closed courts
    When I click edit next to court with "bankruptcy-court-high-court"
    Then I am redirected to the Edit Court page for the "Bankruptcy Court (High Court)"
    When I hover over general nav element
    When I click the general tab
    Then I enter "Amersham Law Courts" in the Name textbox
    And I click the general info save button
    Then The error message displays for general info "All names must be unique. Please check that a user is currently not editing this court, and that a court does not already exists with name: Amersham Law Courts"

  Scenario: Adding intro paragraph welsh and English
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    When I select Include closed courts
    When I click edit next to court with "north-west-regional-divorce-centre"
    Then I am redirected to the Edit Court page for the "North West Regional Divorce Centre"
    When I hover over general nav element
    When I click the general tab
    When I add an "intro paragraph test" in the rich editor field provided "#sc_intro_paragraph"
    When I add an "intro paragraph welsh test" in the rich editor field provided "#sc_intro_paragraph_cy"
    And I click the general info save button
    Then a success message is displayed on the general info tab "General Information updated"

  Scenario: Editing common platform checkbox
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    When I select Include closed courts
    When I click edit next to court with "amersham-law-courts"
    Then I am redirected to the Edit Court page for the "Amersham Law Courts"
    When I hover over general nav element
    When I click the general tab
    Then I edit common platform checkbox
    And I click the general info save button
    Then a success message is displayed on the general info tab "General Information updated"
