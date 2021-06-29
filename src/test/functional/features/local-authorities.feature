Feature: Local authorities

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    Then I can view the courts or tribunals in a list format


  Scenario Outline: Local authorities updated succussfully

    When I click edit next to court with "<view_court_slug>"
    Then I am redirected to the Edit Court page for the chosen court
    When I click the types tab
    And I will make sure Family court type is selected
    And I click on save court type
    And I click the local authorities tab
    And I select area of law "Adoption"
    And I select 'Barking and Dagenham Borough Council'
    And I click on local authorities save button
    Then Success message is displayed for local authorities with summary "Local authorities updated"

    Examples:
      | view_court_slug                         |
      | aylesbury-county-court-and-family-court |

  Scenario Outline: When there are no area of law selected for the chosen court user should get proper error message when he clicks on local authorities

    When I click edit next to court with "<view_court_slug>"
    Then I am redirected to the Edit Court page for the chosen court
    When I click the types tab
    And I will make sure Family court type is selected
    And I click on save court type
    And I click the local authorities tab
    Then An error is displayed for local authorities with title "There is a problem" and summery "You need to enable relevant family court areas of law"

    Examples:
      | view_court_slug         |
      | barry-magistrates-court |



