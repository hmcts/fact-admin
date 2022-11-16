@fact-admin-tab-application-progression
Feature: Application Progression

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    When I go to the courts page
    When I click edit next to court with "probate-service-centre"
    Then I am redirected to the Edit Court page for the chosen court
    When I hover over nav element
    When I click the application progression tab

  Scenario: Add and remove application types for Email
    When I remove all existing application types entries and save
    Then a green update message Application progression updated "Application Progressions updated"
    Then I entered "Get an update" in Type TextBox
    Then I entered "test@gmail.com" in Email TextBox
    Then I entered "welsh test" in welsh type TexTBox
    Then I click on add new application progression
    Then I entered "Get an update" in Type TextBox
    Then I entered "test2@gmail.com" in Email TextBox
    Then I entered "welsh test2" in welsh type TexTBox
    And I click application progression save button
    Then a green update message Application progression updated "Application Progressions updated"
    Then the second last Email is "test@gmail.com"
    And the last email is "test2@gmail.com"

  Scenario: Add and remove application types for External link
    When I remove all existing application types entries and save
    Then a green update message Application progression updated "Application Progressions updated"
    Then I entered "Get an update" in Type TextBox
    Then I entered "www.testlink.com" in External link TextBox
    Then I entered "test description" in External link description TextBox
    Then I entered "welsh test" in External link welsh description TextBox
    And I click application progression save button
    Then a green update message Application progression updated "Application Progressions updated"

  Scenario: Prevent blank entries being added
    When I remove all existing application types entries and save
    Then I entered "Get an update" in Type TextBox
    And I click application progression save button
    Then An error is displayed for application progression with summary "Enter an email address or an external link"
    Then I entered "www.testlink.com" in External link TextBox
    And I click application progression save button
    Then An error is displayed for application progression with summary "Description and link are required to add an external link"
#
  Scenario: Prevent duplicated entries being added
    When I remove all existing application types entries and save
    Then a green update message Application progression updated "Application Progressions updated"
    Then I entered "Get an update" in Type TextBox
    Then I entered "test@gmail.com" in Email TextBox
    And I click application progression save button
    Then a green update message Application progression updated "Application Progressions updated"
    Then I click on add new application progression
    Then I entered "Get an update" in Type TextBox
    Then I entered "test@gmail.com" in Email TextBox
    And I click application progression save button
    Then An error is displayed for application progression with summary "All email addresses must be unique."
